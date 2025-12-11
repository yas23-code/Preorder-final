import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processLogin = async () => {
      try {
        // REQUIRED for finishing email/password and OAuth login
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(window.location.href);

        if (exchangeError) {
          console.error("Session exchange error:", exchangeError);
          navigate("/auth");
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session?.user) {
          navigate("/auth");
          return;
        }

        const userId = session.user.id;

        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        let role = roleRow?.role;

        if (!role) {
          const { data: newRole } = await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: "student" })
            .select()
            .single();

          role = newRole?.role ?? "student";
        }

        if (role === "vendor") navigate("/vendor", { replace: true });
        else navigate("/student", { replace: true });

      } catch (err) {
        console.error("Callback error:", err);
        navigate("/auth");
      }
    };

    processLogin();
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "200px" }}>
      <h2>Loading...</h2>
    </div>
  );
}
