import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    visible: boolean;
    onToggle: () => void;
};

export function PasswordInput({
    value,
    onChange,
    placeholder,
    visible,
    onToggle,
}: PasswordInputProps) {
    return (
        <div className="relative">
            <input
                value={value}
                onChange={onChange}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                className="w-full h-[44px] px-4 pr-12 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]"
            />

            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]"
            >
                {visible ? (
                    <EyeOff size={18} />
                ) : (
                    <Eye size={18} />
                )}
            </button>
        </div>
    );
}