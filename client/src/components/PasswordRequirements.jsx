import { CheckCircle2, Circle } from "lucide-react";
import { getPasswordRequirementStatus } from "../utils/passwordValidation";

const PasswordRequirements = ({ password }) => (
  <ul aria-label="Password requirements" className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 px-2 text-[11px] leading-4 text-gray-500">
    {getPasswordRequirementStatus(password).map(({ key, label, valid }) => (
      <li key={key} className={`flex items-center gap-1.5 ${valid ? "text-blue-600" : "text-gray-500"}`}>
        {valid ? <CheckCircle2 size={13} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
        <span>{label}</span>
      </li>
    ))}
  </ul>
);

export default PasswordRequirements;
