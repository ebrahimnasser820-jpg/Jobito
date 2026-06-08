import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useToast } from "../../../context/ToastContext";

interface MyLoginPageProps {
  onGoogleLogin: (response: CredentialResponse) => void;
}

const MyLoginPage: React.FC<MyLoginPageProps> = ({ onGoogleLogin }) => {
  const { showToast } = useToast();

  return (
    <div style={{ width: "100%", margin: "10px" }}>
      <GoogleLogin
        onSuccess={onGoogleLogin}
        onError={() => showToast("Google login failed", "error")}
        useOneTap
      />
    </div>
  );
};

export default MyLoginPage;
