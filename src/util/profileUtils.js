export const isProfileComplete = (profile) => {
  const missingFields = [];

  if (!profile) {
    return {
      complete: false,
      missingFields: ["Profile not loaded"],
    };
  }

  // Profile picture (support both avatar_url from DB and profileImage from services)
  if (!profile.avatar_url && !profile.profileImage)
    missingFields.push("Profile picture");

  // Phone number
  if (!profile.phone || profile.phone.trim() === "")
    missingFields.push("Phone number");

  // Bio
  if (!profile.bio || profile.bio.trim() === "")
    missingFields.push("Bio");

  // Skills
  if (!profile.skills || profile.skills.length === 0)
    missingFields.push("Skills");

  // Education
  if (!profile.education || profile.education.length === 0)
    missingFields.push("Education");

  // Experience
  if (!profile.experiences || profile.experiences.length === 0)
    missingFields.push("Experience");

  return {
    complete: missingFields.length === 0,
    missingFields,
  };
};