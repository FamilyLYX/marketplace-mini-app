import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BlackButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  withArrow?: boolean;
  className?: string;
}

const BlackButton: React.FC<BlackButtonProps> = ({
  children,
  onClick,
  withArrow = false,
  className = "",
}) => {
  return (
    <Button
      variant="default"
      onClick={onClick}
      className={`bg-black hover:bg-gray-800 text-white rounded-none py-2 px-8 w-full flex items-center justify-center ${className}`}
    >
      <span>{children}</span>
      {withArrow && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
};

export default BlackButton;
