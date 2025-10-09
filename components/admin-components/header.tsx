import React from "react";
import { Menu } from "lucide-react";
import { HeaderProps } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconBell } from "@tabler/icons-react";
import { useGetNotificationsQuery } from "@/services/notifications.service";

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();
  const router = useRouter();

   const { data } = useGetNotificationsQuery(
     { page: 1, paginate: 10 },
     {
       pollingInterval: 300000,
       refetchOnFocus: true,
       refetchOnMountOrArgChange: true,
     }
   );
   const notifications = data?.data || [];
   const hasUnread = notifications.some((n) => !n.read_at);

  const handleNotif = () => {
    router.push("/admin/notification");
  };

  // Ambil data shop
  const user = session?.user;
  const userName = user?.name || "Superadmin";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 relative z-10">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative cursor-pointer border border-gray-300 shadow-md focus:outline focus:outline-sky-500 rounded-lg p-1" onClick={handleNotif}>
          <IconBell className="w-6 h-6" />
          {hasUnread && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
