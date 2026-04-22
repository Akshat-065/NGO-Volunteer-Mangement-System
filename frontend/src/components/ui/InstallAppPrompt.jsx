import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import Button from "./Button";
import { classNames } from "../../utils/formatters";

const InstallAppPrompt = ({ className = "", label = "Install App" }) => {
  const deferredPromptRef = useRef(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPromptRef.current;

    if (!promptEvent) {
      return;
    }

    promptEvent.prompt();
    await promptEvent.userChoice;

    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleInstall}
      className={classNames("gap-2 whitespace-nowrap", className)}
    >
      <Download size={16} />
      {label}
    </Button>
  );
};

export default InstallAppPrompt;
