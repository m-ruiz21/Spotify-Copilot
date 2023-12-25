import { getAuthenticatedUser } from "@/utils/user-server-utils";
import { AuthenticatedUser } from "@/utils/auth-utils";
import { Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { isOk, unwrap } from "@/models/result";
import { Token } from "@prisma/client";

function ProfilePicture() {
    const { data: session } = useSession();

    // dropdown logic
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDropdownToggle = () => {
        setIsDropdownOpen((prevIsDropdownOpen) => !prevIsDropdownOpen);
    };
    
    return (
            <div className="relative pr-8">
                <button onClick={handleDropdownToggle} className="cursor-pointer focus:outline-none">
                    { /*eslint-disable-next-line @next/next/no-img-element */}
                    <img src={session?.user?.image!} alt="profile" className="sm:w-14 w-12 h-auto rounded-full" />
                </button>
                <Transition
                    show={isDropdownOpen}
                    enter="transition duration-150 ease-out"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition duration-100 ease-in"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                {(ref) => (
                    <div ref={ref} className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg origin-top-right z-50">
                        <div className="py-1">
                            <button
                              onClick={() => signOut()}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
                </Transition>
            </div>
        );
};

export default ProfilePicture;