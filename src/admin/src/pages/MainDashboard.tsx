import { useState } from "react"
import { ActiveInternshipIcon, TotalApplicationIcon, TotalIcon, TotalOrganizationIcon } from "../assets/icons"
import Organizations from "../components/organizations"
import User from "../components/User"

const MainDashboard = () => {
	const [activeTab, setActiveTab] = useState("users")

	return (
		<div className="py-[5.9375rem] container">
			<h1 className="font-bold text-5xl mb-6">Admin Dashboard</h1>
			<p className="font-medium text-[2rem] text-[#6A6A6A]">Manage all platform activities from one place.</p>
			<div className="mt-20 grid grid-cols-4 gap-8">
				<div className="px-[1.18rem] py-[1.5625rem] rounded-[15px] shadow-[0_0_4px_rgba(0,0,0,0.25)]">
					<div className="flex items-center justify-between">
						<p className="font-semibold text-[1rem]">Total User's</p>
						<TotalIcon />
					</div>
					<p className="font-bold text-[2.5rem]">1,340</p>
				</div>
				<div className="px-[1.18rem] py-[1.5625rem] rounded-[15px] shadow-[0_0_4px_rgba(0,0,0,0.25)]">
					<div className="flex items-center justify-between">
						<p className="font-semibold text-[1rem]">Total Organizations</p>
						<TotalOrganizationIcon />
					</div>
					<p className="font-bold text-[2.5rem]">1,340</p>
				</div>
				<div className="px-[1.18rem] py-[1.5625rem] rounded-[15px] shadow-[0_0_4px_rgba(0,0,0,0.25)]">
					<div className="flex items-center justify-between">
						<p className="font-semibold text-[1rem]">Active Internships</p>
						<ActiveInternshipIcon />
					</div>
					<p className="font-bold text-[2.5rem]">1,340</p>
				</div>
				<div className="px-[1.18rem] py-[1.5625rem] rounded-[15px] shadow-[0_0_4px_rgba(0,0,0,0.25)]">
					<div className="flex items-center justify-between">
						<p className="font-semibold text-[1rem]">Total Applications</p>
						<TotalApplicationIcon />
					</div>
					<p className="font-bold text-[2.5rem]">1,340</p>
				</div>
			</div>
			<div className="mt-[5.0625rem] flex items-center gap-8 text-[1.25rem] font-semibold">
				<div className={`p-[0.5rem] rounded-[15px] cursor-pointer ${activeTab == "users" ? 'shadow-[0_0_4px_rgba(0,0,0,0.25)] ' : ''}`} onClick={() => setActiveTab("users")}>Users</div>
				<div className={`p-[0.5rem] rounded-[15px] focus:shadow-[0_0_4px_rgba(0,0,0,0.25)] cursor-pointer ${activeTab == "organizations" ? 'shadow-[0_0_4px_rgba(0,0,0,0.25)] ' : ''}`} onClick={() => setActiveTab("organizations")}>Organizations</div>
			</div>

			{/* USERS TAB */}
			{activeTab === "users" && (<User />)}

			{/* ORGANISATIONS TAB */}
			{activeTab == "organizations" && (<Organizations />)}

		</div>
	)
}

export default MainDashboard
