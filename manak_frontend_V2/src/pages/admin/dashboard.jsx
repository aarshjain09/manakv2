import {
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  Building2,
  Tags,
  FolderTree,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Today's Orders",
    value: "0",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Today's Revenue",
    value: "₹0",
    icon: IndianRupee,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Customers",
    value: "0",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Products",
    value: "0",
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    title: "Companies",
    value: "0",
    icon: Building2,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    title: "Brands",
    value: "0",
    icon: Tags,
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
  {
    title: "Categories",
    value: "0",
    icon: FolderTree,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    title: "Pending Orders",
    value: "0",
    icon: Clock3,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Heading */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Good Morning 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome to Manak Distributor Management System
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-card p-6 border border-slate-100 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">

                <div>

                  <p className="text-slate-500 text-sm">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {item.value}
                  </h2>

                </div>

                <div
                  className={`${item.bg} w-14 h-14 rounded-xl flex items-center justify-center`}
                >
                  <Icon
                    className={item.color}
                    size={28}
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* Bottom */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Orders */}

        <div className="bg-white rounded-2xl shadow-card p-6">

          <h2 className="text-xl font-semibold mb-6">
            Recent Orders
          </h2>

          <div className="flex items-center justify-center h-72 text-slate-400">

            No Orders Yet

          </div>

        </div>

        {/* Low Stock */}

        <div className="bg-white rounded-2xl shadow-card p-6">

          <h2 className="text-xl font-semibold mb-6">
            Low Stock Products
          </h2>

          <div className="flex items-center justify-center h-72 text-slate-400">

            No Products

          </div>

        </div>

      </div>

    </div>
  );
}