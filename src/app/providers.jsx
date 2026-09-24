import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import queryClient from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { TourProvider } from "@/tours/TourProvider";

export default function Providers({ children }) {
  const userId = useAuthStore((state) => state.user?._id);
  return (
    <QueryClientProvider client={queryClient}>
      <TourProvider key={userId || "guest"} userId={userId}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: "14px" },
          }}
        />
      </TourProvider>
    </QueryClientProvider>
  );
}
