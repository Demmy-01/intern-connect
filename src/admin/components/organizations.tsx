import { DeleteIcon, EyeIcon } from "../assets/icons"
import { useNavigate } from "react-router-dom"

const organizations = () => {
    const navigate = useNavigate();
    return (
        <div className="shadow-[0_0_4px_rgba(0,0,0,0.25)] rounded-[15px] px-[1.5625rem] py-[2.375rem]  mt-[3.375rem]">
            <h2 className="font-medium mb-0.5 text-[2rem]">Manage Organization’s</h2>
            <p className="font-medium text-[#6A6A6A] text-[1.25rem] mb-[2.0625rem]">View, suspend, or delete user accounts.</p>
            <table className="w-full border-collapse text-[#6A6A6A] font-medium text-[1.25rem] table-fixed">
                <thead className="border-b-[2px] border-b-[#6A6A6A] h-[3rem]">
                    <tr className="font-medium text-[1.25rem] text-[#6A6A6A]">
                        <th className="text-left w-[25%]">Organization</th>
                        <th className="text-left w-[25%]">Location</th>
                        <th className="text-center w-[25%]">Status</th>
                        <th className="text-right pe-12 w-[25%]">Actions</th>
                    </tr>
                </thead>
                <tbody className="align-middle">
                    <tr className="hover:bg-primary-100 h-[5rem]" onClick={() => navigate('/organizationDashboard')}>
                        <td>DANDEM Digitals</td>
                        <td>Lagos</td>
                        <td className="">
                            <div className="bg-[#2563EB] text-[1.25rem] text-white h-[1.9375rem] mx-auto  w-[6.6875rem] flex justify-center items-center rounded-[20px]">
                                <p>Verified</p>
                            </div>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center gap-[0.875rem] justify-end  h-full">
                                <div className="">

                                </div>
                                <DeleteIcon />
                            </div>
                        </td>
                    </tr>

                    <tr className="hover:bg-primary-100 h-[3rem]">
                        <td>John Doe</td>
                        <td>Abuja</td>
                        <td className="">
                            <div className="bg-[#D9D9D9] flex justify-center items-center mx-auto text-[1.25rem] text-[#3A414A] h-[1.9375rem] w-[6.6875rem]  rounded-[20px]">
                                <p>Pending</p>
                            </div>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-[0.875rem]">
                                <div className="w-[6.6875rem] border-[1px] border-[black] flex justify-center font-medium gap-[1.1875rem] items-center h-[1.9375rem] cursor-pointer rounded-[25px] bg-[#D9D9D9]">
                                    <EyeIcon />
                                    <p>View</p>
                                </div>
                                <DeleteIcon />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default organizations
