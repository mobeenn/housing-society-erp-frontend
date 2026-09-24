import { RouterProvider } from "react-router-dom";
import Providers from "./providers";
import AuthInitializer from "./AuthInitializer";
import router from "./routes";

export default function App() {
  return (
    <Providers>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </Providers>
  );
}
