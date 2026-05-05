import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function AfterLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    redirect();
  }, []);

  const redirect = async () => {
    const user = await base44.auth.me();
    if (!user) { navigate("/"); return; }
    const userName = user.email;
    localStorage.setItem("bond_user_name", userName);

    const families = await base44.entities.Family.filter({ user_email: userName });
    if (families.length > 0) { navigate("/my-circle"); return; }

    const volunteers = await base44.entities.Volunteer.filter({ user_email: userName });
    if (volunteers.length > 0) { navigate("/volunteer-dashboard"); return; }

    navigate("/choose-circle");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}