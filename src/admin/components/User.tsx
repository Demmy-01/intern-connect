import { useState } from 'react'

const User = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "John Doe",
            email: "danielkay@gmail.com",
            status: 'Pending',
            active: true
        },
        { id: 2, name: "Jane Doe", email: "danielkay@gmail.com", status: 'Active', active: false }
    ])

    const toggleUserActive = (id: number) => {
        setUsers((prev) => prev.map((user) => user.id === id ? { ...user, active: !user.active } : user))
    }
    return (
        <div className="shadow-[0_0_4px_rgba(0,0,0,0.25)] rounded-[15px] px-[1.5625rem] py-[2.375rem] mt-[3.375rem]">
            <h2 className="font-medium mb-0.5 text-[2rem]">Manage User’s</h2>
            <p className="font-medium text-[#6A6A6A] text-[1.25rem] mb-[2.0625rem]">
                View, suspend, or delete user accounts.
            </p>
            <table className="w-full border-collapse text-[#6A6A6A] font-medium text-[1.25rem] table-fixed">
                <thead className="border-b-[2px] border-b-[#6A6A6A] h-[3rem]">
                    <tr className="font-medium text-[1.25rem] text-[#6A6A6A]">
                        <th className="text-left w-[25%]">User</th>
                        <th className="text-left w-[25%]">Email</th>
                        <th className="text-center w-[25%]">Status</th>
                        <th className="text-right pe-10 w-[25%]">Actions</th>
                    </tr>
                </thead>
                <tbody className="">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-primary-100 h-[5rem]">
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td className="text-center">{user.status}</td>
                            <td className="">
                                <div className="flex items-center gap-[0.875rem] justify-end h-full">
                                    <div
                                        onClick={() => toggleUserActive(user.id)}
                                        className={`w-[3.1875rem] h-[1.375rem] cursor-pointer rounded-[25px] relative flex items-center transition-colors duration-300 ${user.active ? "bg-[#00C2A8]" : "bg-[#A3A3A3]"
                                            }`}
                                    >
                                        <div
                                            className={`w-[1.625rem] h-[1.625rem] rounded-full shadow-[0_0_4px_rgba(0,0,0,0.25)] bg-white absolute transition-transform duration-300 ${user.active
                                                ? "translate-x-0 -left-0.5"
                                                : "translate-x-[1.75rem] -left-0.5"
                                                }`}
                                        ></div>
                                    </div>
                                    <p className="w-[2.8125rem] text-[0.75rem]">
                                        {user.active ? "Active" : "inactive"}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default User
