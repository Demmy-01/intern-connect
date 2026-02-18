import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Moon,
  Sun,
  Eye,
  Mail,
  Phone,
  Link as LinkIcon,
  MapPin,
  Code,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Check,
  Target,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TokenDisplay from "../components/TokenDisplay";
import AISuggestionButton from "../components/AISuggestionButton";
import TokenPurchaseModal from "../components/TokenPurchaseModal";
import AISuggestionModal from "../components/AISuggestionModal";
import DatePicker from "../components/DatePicker";
import DateRangePicker from "../components/DateRangePicker";
import ATSAnalysisSection from "../components/ATSAnalysisSection";
import Navbar from "../components/navbar";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import {
  getCVData,
  saveCVData,
  getTokenBalance as getSupabaseTokenBalance,
  initializeTokenBalance,
} from "../lib/cvDataService";
import {
  getTokenBalance,
  getAISuggestion,
  verifyPayment,
  getATSRecommendation,
  calculateATSScore,
} from "../lib/api";

function CVGenerator() {
  const [darkMode, setDarkMode] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [atsView, setAtsView] = useState(false); // New state for ATS analysis page
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("modern");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // AI and Token state
  const [tokenBalance, setTokenBalance] = useState(100);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // AI Suggestion Modal state
  const [showAISuggestionModal, setShowAISuggestionModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [currentField, setCurrentField] = useState(null);
  const [originalContent, setOriginalContent] = useState("");
  const [atsScore, setAtsScore] = useState(0);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load token balance on mount, check payment callback, and load CV data from Supabase
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.warn("⚠️ User not authenticated, using local storage/cache");
          // Load from local storage if available
          const savedCV = localStorage.getItem("cvData");
          if (savedCV) {
            try {
              setFormData(JSON.parse(savedCV));
            } catch (e) {
              console.error("Failed to parse saved CV data:", e);
            }
          }

          // For non-authenticated users, load balance from cache or API
          const cachedEmail = localStorage.getItem("lastPurchaseEmail");
          const cachedBalance = localStorage.getItem("cachedTokenBalance");
          if (cachedBalance) {
            setTokenBalance(parseInt(cachedBalance, 10));
            console.log(`💰 Loaded cached balance: ${cachedBalance}`);
          }
        } else {
          console.log("✅ User authenticated:", user.email);
          // Load CV data from Supabase for authenticated user
          const cvData = await getCVData();
          if (cvData) {
            console.log("📥 Loaded CV data from Supabase");
            setFormData({
              fullName: cvData.full_name || "",
              email: cvData.email || user.email || "",
              phone: cvData.phone || "",
              linkedin: cvData.linkedin || "",
              location: cvData.location || "",
              summary: cvData.summary || "",
              education: cvData.education || [],
              experiences: cvData.experiences || [],
              projects: cvData.projects || [],
              skills: cvData.skills || "",
              languages: cvData.languages || "",
              certifications: cvData.certifications || "",
            });
          } else {
            // Pre-fill email from authenticated user
            setFormData((prev) => ({ ...prev, email: user.email || "" }));
          }

          // Initialize token balance in Supabase if needed (100 free tokens for new users)
          await initializeTokenBalance(100);

          // Load token balance from Supabase
          const balance = await getSupabaseTokenBalance();
          setTokenBalance(balance);
          console.log(`💰 Loaded Supabase balance: ${balance}`);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }

      // Check for payment callback
      checkPaymentCallback();
    };

    initializeApp();
  }, []);

  const checkPaymentCallback = async () => {
    // Check if we're returning from Paystack
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference) {
      console.log("🔵 Payment reference detected:", reference);

      // Clean up URL immediately to prevent repeated verification attempts
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        // Verify the payment with backend
        const result = await verifyPayment(reference);

        if (result.success) {
          console.log("✅ Payment verified successfully:", result);

          // Update token balance immediately from verification response
          setTokenBalance(result.newBalance);

          // Cache the purchase email and balance for persistence
          if (result.email) {
            localStorage.setItem("lastPurchaseEmail", result.email);
            console.log(`✅ Saved purchase email: ${result.email}`);
          }
          localStorage.setItem("cachedTokenBalance", result.newBalance);

          // Show success message
          toast.success(
            `Payment Successful!\n\n${result.tokensAdded} tokens have been added to your account.\nNew balance: ${result.newBalance} tokens`,
            {
              duration: 5000,
            },
          );

          // Wait for backend to update Supabase, then refresh from database
          setTimeout(async () => {
            try {
              await loadTokenBalance(result.email);
              console.log("✅ Token balance refreshed using purchase email");
            } catch (balanceError) {
              console.warn(
                "⚠️ Failed to refresh balance but using verified balance:",
                balanceError,
              );
            }
          }, 500); // Wait 500ms for backend to write to Supabase
        } else {
          console.error("❌ Payment verification failed:", result);
          toast.error(
            "Payment verification failed.\n\nThis may be due to network connectivity issues.\n\nIf you completed the payment on Paystack, your tokens will be added once the connection is restored.\n\nPlease refresh the page in a few moments or contact support if the issue persists.",
          );
        }
      } catch (error) {
        console.error("❌ Payment verification error:", error);

        // Check if it's a network timeout
        if (
          error.code === "ECONNABORTED" ||
          error.message.includes("timeout") ||
          error.message.includes("Network Error")
        ) {
          toast.error(
            "Network Timeout\n\nUnable to verify payment due to network connectivity issues.\n\nIf you completed the payment on Paystack:\n1. Your payment was likely successful\n2. Tokens will be added once connection is restored\n3. Try refreshing the page in a few moments\n\nIf tokens don't appear, please contact support with your payment reference.",
          );
        } else {
          toast.error(
            "Failed to verify payment.\n\nPlease contact support if you were charged.\nPayment reference: " +
              reference,
          );
        }
      }
    }
  };

  const loadTokenBalance = async (emailOverride = null) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Load from Supabase for authenticated users
        const balance = await getSupabaseTokenBalance();
        setTokenBalance(balance);
        console.log(
          `💰 Loaded token balance from Supabase for ${user.email}: ${balance}`,
        );
      } else {
        // Fallback to API for non-authenticated users
        // Use override email from payment, fallback to form email, then default
        const userEmail =
          emailOverride ||
          formData.email ||
          localStorage.getItem("lastPurchaseEmail") ||
          "default@user.com";
        const data = await getTokenBalance(userEmail);
        setTokenBalance(data.balance);
        console.log(
          `💰 Loaded token balance for ${userEmail}: ${data.balance}`,
        );
      }
    } catch (error) {
      console.error("Failed to load token balance:", error);
      // Fallback to localStorage cache if fetch fails
      const cachedBalance = localStorage.getItem("cachedTokenBalance");
      if (cachedBalance) {
        console.log("⚠️ Using cached token balance:", cachedBalance);
        setTokenBalance(parseInt(cachedBalance, 10));
      }
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    location: "",
    summary: "",
    education: [
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        gpa: "",
      },
    ],
    experiences: [
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
      },
    ],
    projects: [
      {
        projectName: "",
        description: "",
        technologiesUsed: "",
        projectLink: "",
      },
    ],
    skills: "",
    languages: "",
    certifications: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateObjectArrayField = (field, index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addArrayItem = (field, defaultValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Calculate ATS score with debounce - placed after state declarations
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateScore();
    }, 2000); // Calculate 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [formData]); // Only watch formData since it contains all CV data

  // Auto-save CV data to Supabase with debounce
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Only save to Supabase if user is authenticated
          await saveCVData({
            ...formData,
            templateName: template,
          });
          console.log("💾 CV data auto-saved to Supabase");
        } else {
          // Save to local storage for unauthenticated users
          localStorage.setItem("cvData", JSON.stringify(formData));
          console.log("💾 CV data saved to local storage");
        }
      } catch (error) {
        console.error("Error auto-saving CV data:", error);
      }
    }, 3000); // Auto-save 3 seconds after user stops typing

    return () => clearTimeout(saveTimer);
  }, [formData, template]);

  const downloadCV = async () => {
    const element = document.getElementById("cv-preview");
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${formData.fullName || "CV"}.pdf`);
  };

  // AI Suggestion Handler
  const handleAISuggestion = async (field, section, currentValue) => {
    if (!currentValue || currentValue.trim().length === 0) {
      toast.error(
        "Please enter some content first before using AI suggestions",
      );
      return;
    }

    if (tokenBalance < 20) {
      toast.error(
        "Insufficient tokens. Please purchase more tokens to use AI features.",
      );
      setShowPurchaseModal(true);
      return;
    }

    // Store current field and original content
    setCurrentField(field);
    setOriginalContent(currentValue);
    setShowAISuggestionModal(true);
    setAiLoading({ ...aiLoading, [field]: true });

    try {
      // Get userId for token deduction
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const result = await getAISuggestion(currentValue, section, userId);

      if (result.success) {
        setTokenBalance(result.remainingTokens);

        // Set the 3 AI suggestions for modal display
        setAiSuggestions(result.suggestions || [result.suggestion]);
        toast.success(
          `${result.tokensUsed} tokens used. ${result.remainingTokens} remaining.`,
        );
      } else {
        toast.error(`AI suggestion failed: ${result.error}`);
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      if (error.response?.status === 402) {
        toast.error("Insufficient tokens. Please purchase more tokens.");
        setShowPurchaseModal(true);
      } else {
        toast.error("Failed to get AI suggestion. Please try again.");
      }
    } finally {
      setAiLoading({ ...aiLoading, [field]: false });
    }
  };

  const handlePurchaseSuccess = (newBalance) => {
    setShowPurchaseModal(false);
    if (newBalance !== undefined) {
      setTokenBalance(newBalance);
    } else {
      loadTokenBalance();
    }
  };

  const handlePaymentSuccess = (newBalance) => {
    // Update token balance immediately with the returned value
    if (newBalance !== undefined) {
      setTokenBalance(newBalance);
    } else {
      loadTokenBalance();
    }
    setShowPurchaseModal(false);
  };

  const handleSelectSuggestion = (selectedSuggestion) => {
    if (currentField) {
      // Check if this is a nested field (format: arrayName_index)
      if (currentField.includes("_")) {
        const parts = currentField.split("_");
        const fieldType = parts[0]; // e.g., 'experience', 'project', 'education'
        const index = parseInt(parts[1]); // e.g., 0, 1, 2

        // Map field type to array name and key
        const fieldMapping = {
          experience: { array: "experiences", key: "description" },
          project: { array: "projects", key: "description" },
          education: { array: "education", key: "fieldOfStudy" },
        };

        const mapping = fieldMapping[fieldType];
        if (mapping && !isNaN(index)) {
          // Update nested field in array
          updateObjectArrayField(
            mapping.array,
            index,
            mapping.key,
            selectedSuggestion,
          );
          console.log(
            `✅ Applied AI suggestion to ${mapping.array}[${index}].${mapping.key}`,
          );
        } else {
          // Fallback to simple update if mapping not found
          console.warn(
            "⚠️ Field mapping not found, using simple update:",
            currentField,
          );
          updateField(currentField, selectedSuggestion);
        }
      } else {
        // Simple field (summary, skills, etc.)
        updateField(currentField, selectedSuggestion);
        console.log(`✅ Applied AI suggestion to ${currentField}`);
      }

      toast.success("AI suggestion applied!");
    }
    setShowAISuggestionModal(false);
    setCurrentField(null);
    setOriginalContent("");
    setAiSuggestions([]);
  };

  // Calculate ATS score from CV data
  const calculateScore = async () => {
    try {
      // formData already contains experiences, education, projects, skills
      const cvData = {
        ...formData,
        // Map experiences to experience for ATS service compatibility
        experience: formData.experiences || [],
        education: formData.education || [],
        projects: formData.projects || [],
        skills: formData.skills || "",
      };

      const result = await calculateATSScore(cvData);
      if (result.success) {
        setAtsScore(result.overallScore);
      }
    } catch (error) {
      console.error("Failed to calculate ATS score:", error);
    }
  };

  // Handle ATS section improvement with AI
  const handleATSImprovement = async (section) => {
    // Check token balance
    if (tokenBalance < 20) {
      toast.error(
        "Insufficient tokens. You need 20 tokens to use AI improvements.",
      );
      setShowPurchaseModal(true);
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(
        `Generating AI improvements for ${section.name}...`,
      );

      // Get current content for the section
      let currentContent = "";
      let sectionKey = "";

      switch (section.name.toLowerCase()) {
        case "contact info":
          currentContent = `${formData.fullName}\n${formData.email}\n${formData.phone}\n${formData.location}`;
          sectionKey = "contact";
          break;
        case "summary":
          currentContent = formData.summary || "";
          sectionKey = "summary";
          break;
        case "experience":
          currentContent = JSON.stringify(formData.experiences || []);
          sectionKey = "experiences";
          break;
        case "education":
          currentContent = JSON.stringify(formData.education || []);
          sectionKey = "education";
          break;
        case "skills":
          currentContent = formData.skills || "";
          sectionKey = "skills";
          break;
        case "projects":
          currentContent = JSON.stringify(formData.projects || []);
          sectionKey = "projects";
          break;
        default:
          toast.error(`Cannot improve ${section.name} section`);
          toast.dismiss(loadingToast);
          return;
      }

      // Call AI recommendation API
      const result = await getATSRecommendation(
        section.name,
        currentContent,
        section.score,
      );

      toast.dismiss(loadingToast);

      if (result.success) {
        // Update token balance
        setTokenBalance(result.remainingTokens);

        // Show success and recommendation
        toast.success(
          `AI recommendation generated! (${result.tokensUsed} tokens used)`,
        );

        // Display the recommendation in a modal or apply it
        toast.info(result.recommendation, { duration: 8000 });

        // Optionally auto-apply the recommendation
        // You could show a modal here to let user review before applying
      } else {
        toast.error("Failed to generate AI recommendation");
      }
    } catch (error) {
      console.error("ATS improvement error:", error);
      toast.error("Failed to generate AI recommendation. Please try again.");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: darkMode
        ? "#0f1419"
        : "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)",
      padding: "16px",
      paddingTop: "80px", // 64px navbar + 16px breathing room
    },
    maxWidthContainer: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "32px",
      padding: "16px 24px",
      backgroundColor: darkMode ? "#1f2937" : "white",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      flexWrap: "wrap",
      gap: "12px",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flex: 1,
      minWidth: "200px",
    },
    headerIcon: {
      width: "48px",
      height: "48px",
      backgroundColor: "#2563eb",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      flexShrink: 0,
    },
    headerContent: {
      textAlign: "left",
    },
    mainTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: "4px",
    },
    subtitle: {
      color: darkMode ? "#9ca3af" : "#6b7280",
      fontSize: "14px",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
    darkModeButton: {
      backgroundColor: darkMode ? "#374151" : "#e5e7eb",
      border: "none",
      borderRadius: "6px",
      padding: "8px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: darkMode ? "#fbbf24" : "#6b7280",
    },
    previewOnlyButton: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      backgroundColor: "#f3f4f6",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "13px",
      color: "#374151",
      fontWeight: "500",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr",
      gap: "24px",
    },
    mainGridMobile: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
    leftPanel: {
      backgroundColor: darkMode ? "#1f2937" : "white",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      padding: "24px",
      height: "fit-content",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    panelTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#1f2937",
      marginBottom: "16px",
      paddingBottom: "12px",
      borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
    },
    tabNav: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "8px",
      marginBottom: "16px",
    },
    tabNavMobile: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "6px",
      marginBottom: "16px",
    },
    tabButton: {
      padding: "10px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.2s",
    },
    tabButtonActive: {
      backgroundColor: "#2563eb",
      color: "white",
    },
    tabButtonInactive: {
      backgroundColor: darkMode ? "#374151" : "#e5e7eb",
      color: darkMode ? "#d1d5db" : "#6b7280",
    },
    rightPanel: {
      backgroundColor: darkMode ? "#1f2937" : "white",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      padding: "24px",
    },
    formSection: {
      marginBottom: "24px",
    },
    formLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: darkMode ? "#e5e7eb" : "#374151",
      marginBottom: "8px",
      display: "block",
    },
    formInput: {
      width: "100%",
      padding: "10px 12px",
      border: darkMode ? "1px solid #374151" : "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      color: darkMode ? "#ffffff" : "#1f2937",
      boxSizing: "border-box",
      marginBottom: "12px",
    },
    formTextarea: {
      width: "100%",
      padding: "10px 12px",
      border: darkMode ? "1px solid #374151" : "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      color: darkMode ? "#ffffff" : "#1f2937",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "80px",
      marginBottom: "12px",
    },
    itemCard: {
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      borderRadius: "6px",
      padding: "12px",
      marginBottom: "12px",
      border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
    },
    itemHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      fontSize: "13px",
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#6b7280",
    },
    deleteButton: {
      backgroundColor: "#fee2e2",
      border: "none",
      borderRadius: "4px",
      padding: "4px 8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: "#dc2626",
      fontWeight: "500",
    },
    addButton: {
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "10px 16px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      width: "100%",
      justifyContent: "center",
    },
    previewHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "16px",
    },
    downloadButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#2563eb",
      color: "white",
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
    },
    previewContainer: {
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      borderRadius: "8px",
      padding: "16px",
      maxHeight: "85vh",
      overflowY: "auto",
    },
    cvPreview: {
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "32px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
    cvHeader: {
      background: "linear-gradient(to right, #2563eb, #1e40af)",
      color: "white",
      padding: "32px",
      borderRadius: "8px 8px 0 0",
      marginBottom: "24px",
    },
    cvName: {
      fontSize: "32px",
      fontWeight: "bold",
      marginBottom: "12px",
    },
    cvContact: {
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
      opacity: 0.95,
    },
    cvSection: {
      marginBottom: "24px",
    },
    cvSectionTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#1f2937",
      borderBottom: "2px solid #2563eb",
      paddingBottom: "8px",
      marginBottom: "16px",
    },
    cvItem: {
      marginBottom: "16px",
    },
    cvItemTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#1f2937",
    },
    cvItemSubtitle: {
      fontSize: "14px",
      color: "#2563eb",
      fontWeight: "500",
    },
    cvItemDate: {
      fontSize: "13px",
      color: "#6b7280",
      marginTop: "4px",
    },
    cvItemDescription: {
      fontSize: "14px",
      color: "#374151",
      marginTop: "8px",
      lineHeight: "1.5",
    },
  };

  const ModernTemplate = () => (
    <div style={styles.cvPreview}>
      {/* Header */}
      <div style={styles.cvHeader}>
        <h1 style={styles.cvName}>{formData.fullName || "Your Name"}</h1>
        {formData.email && (
          <div style={styles.cvContact}>
            <Mail style={{ width: "14px", height: "14px" }} />
            {formData.email}
          </div>
        )}
        {formData.phone && (
          <div style={styles.cvContact}>
            <Phone style={{ width: "14px", height: "14px" }} />
            {formData.phone}
          </div>
        )}
        {formData.linkedin && (
          <div style={styles.cvContact}>
            <LinkIcon style={{ width: "14px", height: "14px" }} />
            {formData.linkedin}
          </div>
        )}
        {formData.location && (
          <div style={styles.cvContact}>
            <MapPin style={{ width: "14px", height: "14px" }} />
            {formData.location}
          </div>
        )}
      </div>

      {/* Summary */}
      {formData.summary && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Professional Summary</h2>
          <p style={styles.cvItemDescription}>{formData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {formData.experiences.some((exp) => exp.company || exp.position) && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Work Experience</h2>
          {formData.experiences.map(
            (exp, idx) =>
              (exp.company || exp.position) && (
                <div key={idx} style={styles.cvItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <div style={styles.cvItemTitle}>{exp.position}</div>
                      <div style={styles.cvItemSubtitle}>{exp.company}</div>
                    </div>
                    <div style={styles.cvItemDate}>
                      {exp.startDate}
                      {exp.endDate &&
                        !exp.currentlyWorking &&
                        ` - ${exp.endDate}`}
                      {exp.currentlyWorking && " - Present"}
                    </div>
                  </div>
                  {exp.description && (
                    <div style={styles.cvItemDescription}>
                      {exp.description}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Education */}
      {formData.education.some((edu) => edu.institution || edu.degree) && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Education</h2>
          {formData.education.map(
            (edu, idx) =>
              (edu.institution || edu.degree) && (
                <div key={idx} style={styles.cvItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <div style={styles.cvItemTitle}>{edu.degree}</div>
                      <div style={styles.cvItemSubtitle}>{edu.institution}</div>
                      {edu.fieldOfStudy && (
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {edu.fieldOfStudy}
                        </div>
                      )}
                    </div>
                    <div style={styles.cvItemDate}>
                      {edu.startDate}
                      {edu.endDate && ` - ${edu.endDate}`}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Projects */}
      {formData.projects.some(
        (proj) => proj.projectName || proj.description,
      ) && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Projects</h2>
          {formData.projects.map(
            (proj, idx) =>
              (proj.projectName || proj.description) && (
                <div key={idx} style={styles.cvItem}>
                  <div style={styles.cvItemTitle}>{proj.projectName}</div>
                  {proj.technologiesUsed && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#2563eb",
                        fontWeight: "500",
                        marginTop: "4px",
                      }}
                    >
                      {proj.technologiesUsed}
                    </div>
                  )}
                  {proj.description && (
                    <div style={styles.cvItemDescription}>
                      {proj.description}
                    </div>
                  )}
                  {proj.projectLink && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#2563eb",
                        marginTop: "8px",
                      }}
                    >
                      {proj.projectLink}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Skills */}
      {formData.skills && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Skills</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {formData.skills.split("\n").map(
              (skill, idx) =>
                skill.trim() && (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "#e0e7ff",
                      color: "#2563eb",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {skill.trim()}
                  </span>
                ),
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {formData.languages && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Languages</h2>
          {formData.languages.split("\n").map(
            (lang, idx) =>
              lang.trim() && (
                <div key={idx} style={styles.cvItemDescription}>
                  • {lang.trim()}
                </div>
              ),
          )}
        </div>
      )}

      {/* Certifications */}
      {formData.certifications && (
        <div style={styles.cvSection}>
          <h2 style={styles.cvSectionTitle}>Certifications</h2>
          {formData.certifications.split("\n").map(
            (cert, idx) =>
              cert.trim() && (
                <div key={idx} style={styles.cvItemDescription}>
                  • {cert.trim()}
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );

  const ClassicTemplate = () => (
    <div
      style={{
        ...styles.cvPreview,
        border: "2px solid #1f2937",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: "32px",
          borderBottom: "3px solid #2563eb",
        }}
      >
        <h1 style={{ ...styles.cvName, color: "white", marginBottom: "8px" }}>
          {formData.fullName || "Your Name"}
        </h1>
        <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
          {formData.email && <span>{formData.email}</span>}
          {formData.phone && <span>| {formData.phone}</span>}
          {formData.location && <span>| {formData.location}</span>}
        </div>
        {formData.linkedin && (
          <div style={{ fontSize: "13px", marginTop: "8px" }}>
            {formData.linkedin}
          </div>
        )}
      </div>

      {/* Summary */}
      {formData.summary && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <p style={styles.cvItemDescription}>{formData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {formData.experiences.some((exp) => exp.company || exp.position) && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            WORK EXPERIENCE
          </h2>
          {formData.experiences.map(
            (exp, idx) =>
              (exp.company || exp.position) && (
                <div
                  key={idx}
                  style={{ ...styles.cvItem, marginBottom: "20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <div style={styles.cvItemTitle}>{exp.position}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {exp.startDate}
                      {exp.endDate &&
                        !exp.currentlyWorking &&
                        ` - ${exp.endDate}`}
                      {exp.currentlyWorking && " - Present"}
                    </div>
                  </div>
                  <div style={{ ...styles.cvItemSubtitle, color: "#1f2937" }}>
                    {exp.company}
                  </div>
                  {exp.description && (
                    <div style={styles.cvItemDescription}>
                      {exp.description}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Education */}
      {formData.education.some((edu) => edu.institution || edu.degree) && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            EDUCATION
          </h2>
          {formData.education.map(
            (edu, idx) =>
              (edu.institution || edu.degree) && (
                <div
                  key={idx}
                  style={{ ...styles.cvItem, marginBottom: "16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div style={styles.cvItemTitle}>{edu.degree}</div>
                      <div
                        style={{ ...styles.cvItemSubtitle, color: "#1f2937" }}
                      >
                        {edu.institution}
                      </div>
                      {edu.fieldOfStudy && (
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {edu.fieldOfStudy}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {edu.startDate}
                      {edu.endDate && ` - ${edu.endDate}`}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Projects */}
      {formData.projects.some(
        (proj) => proj.projectName || proj.description,
      ) && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            PROJECTS
          </h2>
          {formData.projects.map(
            (proj, idx) =>
              (proj.projectName || proj.description) && (
                <div
                  key={idx}
                  style={{ ...styles.cvItem, marginBottom: "16px" }}
                >
                  <div style={styles.cvItemTitle}>{proj.projectName}</div>
                  {proj.technologiesUsed && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#1f2937",
                        fontWeight: "500",
                        marginTop: "4px",
                      }}
                    >
                      {proj.technologiesUsed}
                    </div>
                  )}
                  {proj.description && (
                    <div style={styles.cvItemDescription}>
                      {proj.description}
                    </div>
                  )}
                  {proj.projectLink && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#1f2937",
                        marginTop: "8px",
                      }}
                    >
                      {proj.projectLink}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Skills */}
      {formData.skills && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            SKILLS
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {formData.skills.split("\n").map(
              (skill, idx) =>
                skill.trim() && (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#1f2937",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: "500",
                      border: "1px solid #d1d5db",
                    }}
                  >
                    {skill.trim()}
                  </span>
                ),
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {formData.languages && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            LANGUAGES
          </h2>
          {formData.languages.split("\n").map(
            (lang, idx) =>
              lang.trim() && (
                <div key={idx} style={styles.cvItemDescription}>
                  • {lang.trim()}
                </div>
              ),
          )}
        </div>
      )}

      {/* Certifications */}
      {formData.certifications && (
        <div style={{ ...styles.cvSection, borderLeft: "4px solid #1f2937" }}>
          <h2
            style={{
              ...styles.cvSectionTitle,
              borderBottom: "2px solid #1f2937",
              color: "#1f2937",
            }}
          >
            CERTIFICATIONS
          </h2>
          {formData.certifications.split("\n").map(
            (cert, idx) =>
              cert.trim() && (
                <div key={idx} style={styles.cvItemDescription}>
                  • {cert.trim()}
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );

  const MinimalTemplate = () => (
    <div style={styles.cvPreview}>
      {/* Header */}
      <div
        style={{
          paddingBottom: "20px",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            ...styles.cvName,
            fontSize: "28px",
            marginBottom: "12px",
          }}
        >
          {formData.fullName || "Your Name"}
        </h1>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          {formData.email && <span>{formData.email}</span>}
          {formData.phone && <span>{formData.phone}</span>}
          {formData.location && <span>{formData.location}</span>}
          {formData.linkedin && <span>{formData.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {formData.summary && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Summary
          </h2>
          <p style={styles.cvItemDescription}>{formData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {formData.experiences.some((exp) => exp.company || exp.position) && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Experience
          </h2>
          {formData.experiences.map(
            (exp, idx) =>
              (exp.company || exp.position) && (
                <div key={idx} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <div style={styles.cvItemTitle}>{exp.position}</div>
                    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                      {exp.startDate}
                      {exp.endDate &&
                        !exp.currentlyWorking &&
                        ` - ${exp.endDate}`}
                      {exp.currentlyWorking && " - Present"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    {exp.company}
                  </div>
                  {exp.description && (
                    <div
                      style={{ ...styles.cvItemDescription, fontSize: "13px" }}
                    >
                      {exp.description}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Education */}
      {formData.education.some((edu) => edu.institution || edu.degree) && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Education
          </h2>
          {formData.education.map(
            (edu, idx) =>
              (edu.institution || edu.degree) && (
                <div key={idx} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <div style={styles.cvItemTitle}>{edu.degree}</div>
                    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                      {edu.startDate}
                      {edu.endDate && ` - ${edu.endDate}`}
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    {edu.institution}
                  </div>
                  {edu.fieldOfStudy && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      {edu.fieldOfStudy}
                    </div>
                  )}
                  {edu.gpa && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Projects */}
      {formData.projects.some(
        (proj) => proj.projectName || proj.description,
      ) && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Projects
          </h2>
          {formData.projects.map(
            (proj, idx) =>
              (proj.projectName || proj.description) && (
                <div key={idx} style={{ marginBottom: "12px" }}>
                  <div style={styles.cvItemTitle}>{proj.projectName}</div>
                  {proj.technologiesUsed && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      {proj.technologiesUsed}
                    </div>
                  )}
                  {proj.description && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginTop: "8px",
                      }}
                    >
                      {proj.description}
                    </div>
                  )}
                  {proj.projectLink && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#2563eb",
                        marginTop: "8px",
                      }}
                    >
                      {proj.projectLink}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Skills */}
      {formData.skills && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Skills
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {formData.skills.split("\n").map(
              (skill, idx) =>
                skill.trim() && (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {skill.trim()}
                  </span>
                ),
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {formData.languages && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Languages
          </h2>
          {formData.languages.split("\n").map(
            (lang, idx) =>
              lang.trim() && (
                <div
                  key={idx}
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  • {lang.trim()}
                </div>
              ),
          )}
        </div>
      )}

      {/* Certifications */}
      {formData.certifications && (
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Certifications
          </h2>
          {formData.certifications.split("\n").map(
            (cert, idx) =>
              cert.trim() && (
                <div
                  key={idx}
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  • {cert.trim()}
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );

  const CVPreview = () => {
    if (template === "classic") return <ClassicTemplate />;
    if (template === "minimal") return <MinimalTemplate />;
    return <ModernTemplate />;
  };

  const renderPersonalTab = () => (
    <div>
      <div style={styles.formSection}>
        <label style={styles.formLabel}>Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          style={styles.formInput}
          value={formData.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.formLabel}>Email</label>
        <input
          type="email"
          placeholder="john@example.com"
          style={styles.formInput}
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.formLabel}>Phone</label>
        <input
          type="tel"
          placeholder="+1 (555) 123-4567"
          style={styles.formInput}
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.formLabel}>LinkedIn Profile</label>
        <input
          type="text"
          placeholder="linkedin.com/in/johndoe"
          style={styles.formInput}
          value={formData.linkedin}
          onChange={(e) => updateField("linkedin", e.target.value)}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.formLabel}>Location</label>
        <input
          type="text"
          placeholder="New York, USA"
          style={styles.formInput}
          value={formData.location}
          onChange={(e) => updateField("location", e.target.value)}
        />
      </div>
    </div>
  );

  const renderSummaryTab = () => (
    <div>
      <div style={styles.formSection}>
        <label style={styles.formLabel}>Professional Summary</label>
        <textarea
          placeholder="A brief summary of your professional background and career objectives..."
          style={styles.formTextarea}
          value={formData.summary}
          onChange={(e) => updateField("summary", e.target.value)}
        />
        <AISuggestionButton
          onClick={() =>
            handleAISuggestion("summary", "summary", formData.summary)
          }
          loading={aiLoading.summary}
          disabled={tokenBalance < 20}
          darkMode={darkMode}
        />
      </div>
    </div>
  );

  const renderEducationTab = () => (
    <div>
      <div style={{ marginBottom: "16px" }}>
        {formData.education.map((edu, idx) => (
          <div key={idx} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <span>Education {idx + 1}</span>
              {idx > 0 && (
                <button
                  onClick={() => removeArrayItem("education", idx)}
                  style={styles.deleteButton}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                  Delete
                </button>
              )}
            </div>

            <label style={styles.formLabel}>Institution</label>
            <input
              type="text"
              placeholder="University Name"
              style={styles.formInput}
              value={edu.institution}
              onChange={(e) =>
                updateObjectArrayField(
                  "education",
                  idx,
                  "institution",
                  e.target.value,
                )
              }
            />

            <label style={styles.formLabel}>Degree</label>
            <input
              type="text"
              placeholder="Bachelor's"
              style={styles.formInput}
              value={edu.degree}
              onChange={(e) =>
                updateObjectArrayField(
                  "education",
                  idx,
                  "degree",
                  e.target.value,
                )
              }
            />

            <label style={styles.formLabel}>Field of Study</label>
            <input
              type="text"
              placeholder="Computer Science"
              style={styles.formInput}
              value={edu.fieldOfStudy}
              onChange={(e) =>
                updateObjectArrayField(
                  "education",
                  idx,
                  "fieldOfStudy",
                  e.target.value,
                )
              }
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <div>
                <label style={styles.formLabel}>Start Date</label>
                <input
                  type="text"
                  placeholder="2020"
                  style={styles.formInput}
                  value={edu.startDate}
                  onChange={(e) =>
                    updateObjectArrayField(
                      "education",
                      idx,
                      "startDate",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <label style={styles.formLabel}>End Date</label>
                <input
                  type="text"
                  placeholder="2024"
                  style={styles.formInput}
                  value={edu.endDate}
                  onChange={(e) =>
                    updateObjectArrayField(
                      "education",
                      idx,
                      "endDate",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <label style={styles.formLabel}>GPA (Optional)</label>
            <input
              type="text"
              placeholder="3.8/4.0"
              style={styles.formInput}
              value={edu.gpa}
              onChange={(e) =>
                updateObjectArrayField("education", idx, "gpa", e.target.value)
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          addArrayItem("education", {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            gpa: "",
          })
        }
        style={styles.addButton}
      >
        <Plus style={{ width: "16px", height: "16px" }} />
        Add Education
      </button>
    </div>
  );

  const renderExperienceTab = () => (
    <div>
      <div style={{ marginBottom: "16px" }}>
        {formData.experiences.map((exp, idx) => (
          <div key={idx} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <span>Experience {idx + 1}</span>
              {idx > 0 && (
                <button
                  onClick={() => removeArrayItem("experiences", idx)}
                  style={styles.deleteButton}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                  Delete
                </button>
              )}
            </div>

            <label style={styles.formLabel}>Company</label>
            <input
              type="text"
              placeholder="Company Name"
              style={styles.formInput}
              value={exp.company}
              onChange={(e) =>
                updateObjectArrayField(
                  "experiences",
                  idx,
                  "company",
                  e.target.value,
                )
              }
            />

            <label style={styles.formLabel}>Position</label>
            <input
              type="text"
              placeholder="Software Engineer Intern"
              style={styles.formInput}
              value={exp.position}
              onChange={(e) =>
                updateObjectArrayField(
                  "experiences",
                  idx,
                  "position",
                  e.target.value,
                )
              }
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label style={styles.formLabel}>Date Range</label>
                <DateRangePicker
                  startDate={exp.startDate}
                  endDate={exp.endDate}
                  onStartChange={(date) =>
                    updateObjectArrayField(
                      "experiences",
                      idx,
                      "startDate",
                      date,
                    )
                  }
                  onEndChange={(date) =>
                    updateObjectArrayField("experiences", idx, "endDate", date)
                  }
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div
              style={{
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                id={`current-${idx}`}
                checked={exp.currentlyWorking}
                onChange={(e) =>
                  updateObjectArrayField(
                    "experiences",
                    idx,
                    "currentlyWorking",
                    e.target.checked,
                  )
                }
                style={{ cursor: "pointer" }}
              />
              <label
                htmlFor={`current-${idx}`}
                style={{
                  fontSize: "13px",
                  cursor: "pointer",
                  color: darkMode ? "#d1d5db" : "#6b7280",
                }}
              >
                I currently work here
              </label>
            </div>

            <label style={styles.formLabel}>Description</label>
            <textarea
              placeholder="Developed features using React and TypeScript..."
              style={styles.formTextarea}
              value={exp.description}
              onChange={(e) =>
                updateObjectArrayField(
                  "experiences",
                  idx,
                  "description",
                  e.target.value,
                )
              }
            />
            <AISuggestionButton
              onClick={() =>
                handleAISuggestion(
                  `experience_${idx}`,
                  "experience",
                  exp.description,
                )
              }
              loading={aiLoading[`experience_${idx}`]}
              disabled={tokenBalance < 20}
              darkMode={darkMode}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          addArrayItem("experiences", {
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            currentlyWorking: false,
            description: "",
          })
        }
        style={styles.addButton}
      >
        <Plus style={{ width: "16px", height: "16px" }} />
        Add Experience
      </button>
    </div>
  );

  const renderProjectsTab = () => (
    <div>
      <div style={{ marginBottom: "16px" }}>
        {formData.projects.map((proj, idx) => (
          <div key={idx} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <span>Project {idx + 1}</span>
              {idx > 0 && (
                <button
                  onClick={() => removeArrayItem("projects", idx)}
                  style={styles.deleteButton}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                  Delete
                </button>
              )}
            </div>

            <label style={styles.formLabel}>Project Name</label>
            <input
              type="text"
              placeholder="E-commerce Platform"
              style={styles.formInput}
              value={proj.projectName}
              onChange={(e) =>
                updateObjectArrayField(
                  "projects",
                  idx,
                  "projectName",
                  e.target.value,
                )
              }
            />

            <label style={styles.formLabel}>Description</label>
            <textarea
              placeholder="Built a full-stack e-commerce platform with user authentication, shopping cart, and payment integration"
              style={styles.formTextarea}
              value={proj.description}
              onChange={(e) =>
                updateObjectArrayField(
                  "projects",
                  idx,
                  "description",
                  e.target.value,
                )
              }
            />

            <label style={styles.formLabel}>Technologies Used</label>
            <input
              type="text"
              placeholder="React, Node.js, MongoDB, Stripe"
              style={styles.formInput}
              value={proj.technologiesUsed}
              onChange={(e) =>
                updateObjectArrayField(
                  "projects",
                  idx,
                  "technologiesUsed",
                  e.target.value,
                )
              }
            />

            <label style={styles.formLabel}>Project Link (Optional)</label>
            <input
              type="text"
              placeholder="https://github.com/username/project"
              style={styles.formInput}
              value={proj.projectLink}
              onChange={(e) =>
                updateObjectArrayField(
                  "projects",
                  idx,
                  "projectLink",
                  e.target.value,
                )
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          addArrayItem("projects", {
            projectName: "",
            description: "",
            technologiesUsed: "",
            projectLink: "",
          })
        }
        style={styles.addButton}
      >
        <Plus style={{ width: "16px", height: "16px" }} />
        Add Project
      </button>
    </div>
  );

  const renderSkillsTab = () => (
    <div>
      <div style={styles.formSection}>
        <label style={styles.formLabel}>Skills (one per line)</label>
        <textarea
          placeholder="JavaScript&#10;React&#10;TypeScript&#10;Node.js&#10;Git"
          style={styles.formTextarea}
          value={formData.skills}
          onChange={(e) => updateField("skills", e.target.value)}
        />
      </div>
    </div>
  );

  const renderAdditionalTab = () => (
    <div>
      <div style={styles.formSection}>
        <label style={styles.formLabel}>Languages (one per line)</label>
        <textarea
          placeholder="English (Native)&#10;Spanish (Fluent)&#10;French (Intermediate)"
          style={styles.formTextarea}
          value={formData.languages}
          onChange={(e) => updateField("languages", e.target.value)}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.formLabel}>Certifications (one per line)</label>
        <textarea
          placeholder="AWS Certified Developer&#10;Google Analytics Certified&#10;Scrum Master Certified"
          style={styles.formTextarea}
          value={formData.certifications}
          onChange={(e) => updateField("certifications", e.target.value)}
        />
      </div>
    </div>
  );

  const tabs = [
    { id: "personal", icon: User, label: "Personal Info" },
    { id: "summary", icon: BookOpen, label: "Summary" },
    { id: "education", icon: GraduationCap, label: "Education" },
    { id: "experience", icon: Briefcase, label: "Experience" },
    { id: "projects", icon: Code, label: "Projects" },
    { id: "skills", icon: Award, label: "Skills" },
    { id: "additional", icon: LinkIcon, label: "Additional" },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.maxWidthContainer}>
        {/* Header */}
        <div
          style={{
            ...styles.header,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            padding: isMobile ? "12px 16px" : "16px 24px",
          }}
        >
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <FileText style={{ width: "24px", height: "24px" }} />
            </div>
            <div style={styles.headerContent}>
              <h1 style={styles.mainTitle}>Intern Connect CV Generator</h1>
              <p style={styles.subtitle}>
                Create your professional CV with live preview
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <TokenDisplay
              balance={tokenBalance}
              onPurchaseClick={() => setShowPurchaseModal(true)}
              darkMode={darkMode}
            />
            <button
              style={styles.darkModeButton}
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <Sun style={{ width: "18px", height: "18px" }} />
              ) : (
                <Moon style={{ width: "18px", height: "18px" }} />
              )}
            </button>
            <button
              style={{
                ...styles.previewOnlyButton,
                backgroundColor: previewOnly ? "#2563eb" : "#f3f4f6",
                color: previewOnly ? "white" : "#374151",
                borderColor: previewOnly ? "#2563eb" : "#d1d5db",
              }}
              onClick={() => setPreviewOnly(!previewOnly)}
            >
              <Eye style={{ width: "14px", height: "14px" }} />
              <span>Preview Only</span>
            </button>
            <button
              style={{
                ...styles.previewOnlyButton,
                backgroundColor: atsView ? "#10b981" : "#f3f4f6",
                color: atsView ? "white" : "#374151",
                borderColor: atsView ? "#10b981" : "#d1d5db",
              }}
              onClick={() => {
                setAtsView(!atsView);
                setPreviewOnly(false); // Exit preview mode when entering ATS view
              }}
            >
              <Target style={{ width: "14px", height: "14px" }} />
              <span>ATS Analysis</span>
            </button>
          </div>
        </div>

        {/* Main Content - ATS Analysis Page */}
        {atsView ? (
          <div
            style={{
              padding: isMobile ? "16px" : "24px",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            <ATSAnalysisSection
              cvData={{
                ...formData,
                experience: formData.experiences || [],
                education: formData.education || [],
                projects: formData.projects || [],
                skills: formData.skills || "",
              }}
              darkMode={darkMode}
              onImproveSection={handleATSImprovement}
              tokenBalance={tokenBalance}
            />
          </div>
        ) : !previewOnly ? (
          <div style={isMobile ? styles.mainGridMobile : styles.mainGrid}>
            {/* Left Panel - Tabs and Form */}
            <div
              style={{
                ...styles.leftPanel,
                maxHeight: isMobile ? "unset" : "90vh",
                padding: isMobile ? "16px" : "24px",
              }}
            >
              <h2 style={styles.panelTitle}>CV Information</h2>

              {/* Define tabs array */}
              {(() => {
                const tabs = [
                  { id: "personal", label: "Personal", icon: User },
                  { id: "summary", label: "Summary", icon: FileText },
                  { id: "education", label: "Education", icon: GraduationCap },
                  { id: "experience", label: "Experience", icon: Briefcase },
                  { id: "projects", label: "Projects", icon: Code },
                  { id: "skills", label: "Skills", icon: Award },
                  { id: "additional", label: "Additional", icon: Plus },
                ];

                return (
                  <div style={isMobile ? styles.tabNavMobile : styles.tabNav}>
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          style={{
                            ...styles.tabButton,
                            ...(activeTab === tab.id
                              ? styles.tabButtonActive
                              : styles.tabButtonInactive),
                            fontSize: isMobile ? "11px" : "13px",
                            padding: isMobile ? "8px 10px" : "10px 12px",
                          }}
                        >
                          <IconComponent
                            style={{ width: "14px", height: "14px" }}
                          />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Form Content */}
              <div style={{ marginTop: "16px" }}>
                {activeTab === "personal" && renderPersonalTab()}
                {activeTab === "summary" && renderSummaryTab()}
                {activeTab === "education" && renderEducationTab()}
                {activeTab === "experience" && renderExperienceTab()}
                {activeTab === "projects" && renderProjectsTab()}
                {activeTab === "skills" && renderSkillsTab()}
                {activeTab === "additional" && renderAdditionalTab()}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div
              style={{
                ...styles.rightPanel,
                padding: isMobile ? "16px" : "24px",
                maxHeight: isMobile ? "unset" : "auto",
              }}
            >
              <div
                style={{
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: darkMode ? "#ffffff" : "#1f2937",
                    marginBottom: "12px",
                  }}
                >
                  Choose Your Template
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    marginBottom: "16px",
                  }}
                >
                  Select a design that best represents you
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {/* Modern Template */}
                  <div
                    onClick={() => setTemplate("modern")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor:
                        template === "modern"
                          ? "#dbeafe"
                          : darkMode
                            ? "#374151"
                            : "#f3f4f6",
                      border:
                        template === "modern"
                          ? "2px solid #2563eb"
                          : darkMode
                            ? "1px solid #4b5563"
                            : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <Sparkles
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "#2563eb",
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "600",
                          color: darkMode ? "#ffffff" : "#1f2937",
                          fontSize: "13px",
                        }}
                      >
                        Modern
                      </span>
                      {template === "modern" && (
                        <div style={{ marginLeft: "auto" }}>
                          <Check
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#2563eb",
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: darkMode ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      Bold header with modern styling
                    </p>
                  </div>

                  {/* Classic Template */}
                  <div
                    onClick={() => setTemplate("classic")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor:
                        template === "classic"
                          ? "#dbeafe"
                          : darkMode
                            ? "#374151"
                            : "#f3f4f6",
                      border:
                        template === "classic"
                          ? "2px solid #2563eb"
                          : darkMode
                            ? "1px solid #4b5563"
                            : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <FileText
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "#1f2937",
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "600",
                          color: darkMode ? "#ffffff" : "#1f2937",
                          fontSize: "13px",
                        }}
                      >
                        Classic
                      </span>
                      {template === "classic" && (
                        <div style={{ marginLeft: "auto" }}>
                          <Check
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#2563eb",
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: darkMode ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      Traditional professional layout
                    </p>
                  </div>

                  {/* Minimal Template */}
                  <div
                    onClick={() => setTemplate("minimal")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor:
                        template === "minimal"
                          ? "#dbeafe"
                          : darkMode
                            ? "#374151"
                            : "#f3f4f6",
                      border:
                        template === "minimal"
                          ? "2px solid #2563eb"
                          : darkMode
                            ? "1px solid #4b5563"
                            : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <Layers
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "#6366f1",
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "600",
                          color: darkMode ? "#ffffff" : "#1f2937",
                          fontSize: "13px",
                        }}
                      >
                        Minimal
                      </span>
                      {template === "minimal" && (
                        <div style={{ marginLeft: "auto" }}>
                          <Check
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#2563eb",
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: darkMode ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      Clean and contemporary design
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...styles.previewHeader,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "12px" : "0",
                }}
              >
                <h2 style={{ ...styles.mainTitle, marginBottom: 0 }}>
                  Preview
                </h2>
                <button
                  onClick={downloadCV}
                  style={{
                    ...styles.downloadButton,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  <Download style={{ width: "16px", height: "16px" }} />
                  Download PDF
                </button>
              </div>

              <div style={styles.previewContainer}>
                <div id="cv-preview">
                  <CVPreview />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              ...styles.rightPanel,
              padding: isMobile ? "16px" : "24px",
            }}
          >
            <div
              style={{
                ...styles.previewHeader,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? "12px" : "0",
              }}
            >
              <h2 style={{ ...styles.mainTitle, marginBottom: 0 }}>Preview</h2>
              <button
                onClick={downloadCV}
                style={{
                  ...styles.downloadButton,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <Download style={{ width: "16px", height: "16px" }} />
                Download
              </button>
            </div>

            <div style={styles.previewContainer}>
              <div id="cv-preview">
                <CVPreview />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
        darkMode={darkMode}
        userEmail={formData.email}
      />

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={showAISuggestionModal}
        onClose={() => {
          setShowAISuggestionModal(false);
          setCurrentField(null);
          setOriginalContent("");
          setAiSuggestions([]);
        }}
        suggestions={aiSuggestions}
        onSelect={handleSelectSuggestion}
        darkMode={darkMode}
        loading={aiLoading[currentField]}
        originalContent={originalContent}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={true}
        toastOptions={{
          duration: 5000,
          style: {
            background: darkMode ? "#1f2937" : "#ffffff",
            color: darkMode ? "#ffffff" : "#1f2937",
            fontSize: "14px",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      </div>
    </>
  );
}

export default CVGenerator;
