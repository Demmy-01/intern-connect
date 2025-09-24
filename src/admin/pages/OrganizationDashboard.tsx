import { RightArrowIcon } from "../assets/icons"
import CompanyImage from "../assets/Rectangle 160.png"
import { Link } from "react-router-dom"
import { VscMail } from "react-icons/vsc";
import { FaPhone } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";

const OrganizationDashboard = () => {
  return (
    <div className="py-[5.0625rem] container">
      <Link to='/' className="flex w-[17.4375rem] mb-[4.9375rem] justify-center items-center gap-[1.373125rem] h-[3.3125rem] rounded-[10px] border-[1px]">
        <RightArrowIcon />
        <p className="font-medium text-[1.25rem]">Back to Dashboard</p>
      </Link>
      <div className="px-12 shadow-md py-14 rounded-[10px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-[7.75rem]">
              <img src={CompanyImage} alt="" />
            </div>
            <div className="leading-6">
              <p className="font-medium text-[2.5rem] mb-3">Microsoft</p>
              <p>Verification Request</p>
            </div>
          </div>
          <div  className="bg-[#D9D9D9] flex justify-center items-center text-[1.25rem] text-[#3A414A] h-[1.9375rem] w-[6.6875rem] rounded-[20px]">
            <p>Pending</p>
          </div>
        </div>
        <div className="mt-[3.5rem] pb-7">
          <p className="font-medium text-[2rem]">About Organization</p>
          <p className="font-medium text-2xl text-[#3A414A] mt-6">Microsoft is an American multinational technology corporation, co-founded by Bill Gates and Paul Allen in 1975, that provides software, cloud services, hardware, and gaming products, and is best known for its Microsoft Windows operating system, Office productivity suite, and Azure cloud platform</p>
        </div>
        <div className="pt-8 border-t-[1px] border-t-black border-b-[1px] border-b-black">
          <p className="font-medium text-[2rem]">Contact Information</p>
          <div className="pb-11">
            <div className="grid gap-11 grid-cols-2 justify-between mt-6">
              <div className="flex gap-6 items-center">
                <VscMail className="w-11 h-11"/>
                <div>
                  <p className="font-medium text-[2rem]">Email</p>
                  <p className="font-medium text-2xl">microsoft@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-6 items-center">
                <FaPhone className="w-11 h-11"/>
                <div>
                  <p className="font-medium text-[2rem]">Phone</p>
                  <p className="font-medium text-2xl">+234 8134 764 384</p>
                </div>
              </div>
              <div className="flex gap-6 items-center">
                <VscMail className="w-11 h-11"/>
                <div>
                  <p className="font-medium text-[2rem]">Email</p>
                  <p className="font-medium text-2xl">microsoft@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-6 items-center">
                <IoLocationOutline className="w-11 h-11"/>
                <div>
                  <p className="font-medium text-[2rem]">Location</p>
                  <p className="font-medium text-2xl">36 Lekki Phase, Lagos, Nigeria</p>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
        <div className="pt-5">
          <p className="font-medium text-[2rem] mb-11">Submitted Documents</p>
          <div className="flex gap-8 items-center">
            <p className="text-[#2563EB] text-2xl font-medium">microsoft_CAC.doc</p>
            <p className="text-[#2563EB] text-2xl font-medium">microsoft_licence.doc</p>
          </div>
          <div className="flex justify-end gap-[2.825rem] items-center">
            <div className="w-[8.8125rem] h-[2.75rem] flex justify-center items-center rounded-[10px] bg-[#77CC00] text-white">
              <p>Accept</p>
            </div>
            <div className="w-[8.8125rem] h-[2.75rem] flex justify-center items-center rounded-[10px] bg-[#FF4141] text-[white]">
              <p>Reject</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationDashboard
