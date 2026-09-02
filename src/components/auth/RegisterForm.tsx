"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister, useSendVerificationCode } from "@/hooks/api/useAuth";
import { Eye, EyeOff, X, ChevronRight } from "lucide-react";

export default function RegisterForm() {
	const router = useRouter();

	const register = useRegister();
	const sendCode = useSendVerificationCode();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	const [showEpcModal, setShowEpcModal] = useState(false);

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [form, setForm] = useState({
		account: "",
		password: "",
		confirmPassword: "",
		email: "",
		timezone: "(UTC+5:30) Colombo, New Delhi",
		verificationCode: "",

		// EPC Details
		epcCompany: "",
		epcInstaller: "",
		epcMobile: "",
		epcEmail: "",
		epcAddress: "",
	});

	const setField = (field: keyof typeof form, value: string) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// -----------------------------
	// Step 1 validation
	// -----------------------------
	const validateBasicForm = () => {
		if (!form.account.trim()) {
			return "Account is required.";
		}

		if (!form.password.trim()) {
			return "Password is required.";
		}

		if (form.password.length < 8) {
			return "Password must be at least 8 characters.";
		}

		if (!form.confirmPassword.trim()) {
			return "Confirm password is required.";
		}

		if (form.password !== form.confirmPassword) {
			return "Password and confirm password must match.";
		}

		if (!form.email.trim()) {
			return "Email is required.";
		}

		if (!/^\S+@\S+\.\S+$/.test(form.email)) {
			return "Please enter a valid email.";
		}

		if (!form.verificationCode.trim()) {
			return "Verification code is required.";
		}

		return null;
	};

	// -----------------------------
	// Next button
	// -----------------------------
	const handleNext = () => {
		setErrorMessage(null);
		setSuccessMessage(null);

		const validationError = validateBasicForm();

		if (validationError) {
			setErrorMessage(validationError);
			return;
		}

		// Open EPC modal
		setShowEpcModal(true);
	};

	// -----------------------------
	// EPC validation
	// -----------------------------
	const validateEpcForm = () => {
		if (!form.epcCompany.trim()) {
			return "EPC company is required.";
		}

		if (!form.epcInstaller.trim()) {
			return "EPC installer is required.";
		}

		if (!/^\d{10}$/.test(form.epcMobile.trim())) {
			return "EPC mobile must be exactly 10 digits.";
		}

		if (!form.epcEmail.trim()) {
			return "EPC email is required.";
		}

		if (!/^\S+@\S+\.\S+$/.test(form.epcEmail)) {
			return "Please enter a valid EPC email.";
		}

		if (!form.epcAddress.trim()) {
			return "EPC address is required.";
		}

		return null;
	};

	// -----------------------------
	// Final registration
	// -----------------------------
	const handleRegisterSubmit = async () => {
		setErrorMessage(null);
		setSuccessMessage(null);

		if (!acceptedTerms) {
			setErrorMessage(
				"Please accept the Privacy Policy & Terms and Conditions.",
			);
			setShowEpcModal(false);
			return;
		}

		const validationError = validateEpcForm();

		if (validationError) {
			setErrorMessage(validationError);
			return;
		}

		try {
			await register.mutateAsync(form);

			setShowEpcModal(false);

			setSuccessMessage(
				"Registration successful. Redirecting to login...",
			);

			setTimeout(() => {
				router.push("/login");
			}, 1200);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Registration failed.",
			);
		}
	};

	return (
		<>
			<div className="w-full max-w-sm space-y-6">
				<h2 className="text-xl font-semibold mb-6 text-center">
					Register
				</h2>

				{/* Account */}
				<input
					className="input border border-gray-400 w-full rounded-sm p-1.5"
					value={form.account}
					onChange={(e) =>
						setField("account", e.target.value)
					}
					placeholder="Please enter account"
				/>

				{/* Password */}
				<div className="relative">
					<input
						className="input border border-gray-400 w-full rounded-sm p-1.5 pr-10"
						type={showPassword ? "text" : "password"}
						value={form.password}
						onChange={(e) =>
							setField("password", e.target.value)
						}
						placeholder="Please enter your password"
					/>

					<button
						type="button"
						onClick={() =>
							setShowPassword(!showPassword)
						}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
					>
						{showPassword ? (
							<Eye size={18} />
						) : (
							<EyeOff size={18} />
						)}
					</button>
				</div>

				{/* Confirm Password */}
				<div className="relative">
					<input
						className="input border border-gray-400 w-full rounded-sm p-1.5 pr-10"
						type={
							showConfirmPassword
								? "text"
								: "password"
						}
						value={form.confirmPassword}
						onChange={(e) =>
							setField(
								"confirmPassword",
								e.target.value,
							)
						}
						placeholder="Please enter your confirm password"
					/>

					<button
						type="button"
						onClick={() =>
							setShowConfirmPassword(
								!showConfirmPassword,
							)
						}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
					>
						{showConfirmPassword ? (
							<Eye size={18} />
						) : (
							<EyeOff size={18} />
						)}
					</button>
				</div>

				{/* Email */}
				<input
					className="input border border-gray-400 w-full rounded-sm p-1.5"
					value={form.email}
					onChange={(e) =>
						setField("email", e.target.value)
					}
					placeholder="Please enter your email"
				/>

				{/* Timezone */}
				<select
					value={form.timezone}
					onChange={(e) =>
						setField("timezone", e.target.value)
					}
					className="input border border-gray-400 w-full rounded-sm p-1.5"
				>
					<option>
						(UTC+5:30) Colombo, New Delhi
					</option>
				</select>

				{/* Verification */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
					<input
						className="input border border-gray-400 w-full rounded-sm p-1.5"
						value={form.verificationCode}
						onChange={(e) =>
							setField(
								"verificationCode",
								e.target.value,
							)
						}
						placeholder="Code"
					/>

					<button
						type="button"
						onClick={() =>
							sendCode.mutate({
								account: form.account,
								email: form.email,
								purpose: "registration",
							})
						}
						disabled={sendCode.isPending}
						className="btn-secondary sm:w-full bg-blue-500 text-white rounded-sm p-1.5 cursor-pointer"
					>
						{sendCode.isPending
							? "Sending..."
							: "Verification Code"}
					</button>
				</div>

				{/* Error */}
				{errorMessage && (
					<p className="text-red-500 text-sm text-center">
						{errorMessage}
					</p>
				)}

				{/* Success */}
				{successMessage && (
					<p className="text-green-600 text-sm text-center">
						{successMessage}
					</p>
				)}

				{/* Terms */}
				<div className="flex items-start gap-2 mt-2">
					<input
						id="acceptTerms"
						type="checkbox"
						checked={acceptedTerms}
						onChange={(e) =>
							setAcceptedTerms(e.target.checked)
						}
						className="mt-1 h-4 w-4 cursor-pointer"
					/>

					<label
						htmlFor="acceptTerms"
						className="text-sm text-gray-600 leading-5"
					>
						I have read and agree to the{" "}
						<a
							href="https://solarlogger.in/terms-conditions"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline font-medium"
						>
							Privacy Policy & Terms and Conditions
						</a>
						.
					</label>
				</div>

				{/* NEXT BUTTON */}
				<div className="flex flex-col">
					<button
						type="button"
						onClick={handleNext}
						disabled={!acceptedTerms}
						className={`rounded-sm p-1.5 text-white transition-colors flex items-center justify-center gap-2 ${
							!acceptedTerms
								? "bg-gray-400 cursor-not-allowed"
								: "bg-blue-500 hover:bg-blue-600 cursor-pointer"
						}`}
					>
						Next
						<ChevronRight size={18} />
					</button>

					<Link
						href="/login"
						className="text-center text-sm mt-3 text-blue-600 cursor-pointer"
					>
						Already have an account?
					</Link>
				</div>
			</div>

			{/* ========================================= */}
			{/* EPC MODAL */}
			{/* ========================================= */}
			{showEpcModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">

						{/* Header */}
						<div className="flex items-center justify-between border-b px-6 py-4">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									EPC Details
								</h3>

								{/* <p className="text-sm text-gray-500 mt-1">
									Please provide your EPC information
								</p> */}
							</div>

							<button
								type="button"
								onClick={() =>
									setShowEpcModal(false)
								}
								className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>

						{/* Body */}
						<div className="px-6 py-5 space-y-4">

							{/* EPC Company */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									EPC Company
								</label>

								<input
									className="w-full rounded-sm border border-gray-400 p-2 outline-none focus:border-blue-500"
									value={form.epcCompany}
									onChange={(e) =>
										setField(
											"epcCompany",
											e.target.value,
										)
									}
									placeholder="Enter EPC company"
								/>
							</div>

							{/* EPC Installer */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									EPC Installer
								</label>

								<input
									className="w-full rounded-sm border border-gray-400 p-2 outline-none focus:border-blue-500"
									value={form.epcInstaller}
									onChange={(e) =>
										setField(
											"epcInstaller",
											e.target.value,
										)
									}
									placeholder="Enter installer name"
								/>
							</div>

							{/* Mobile + Email */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										EPC Mobile
									</label>

									<input
										type="tel"
										inputMode="numeric"
										maxLength={10}
										className="w-full rounded-sm border border-gray-400 p-2 outline-none focus:border-blue-500"
										value={form.epcMobile}
										onChange={(e) =>
											setField(
												"epcMobile",
												e.target.value.replace(
													/\D/g,
													"",
												),
											)
										}
										placeholder="10 digit mobile"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										EPC Email
									</label>

									<input
										type="email"
										className="w-full rounded-sm border border-gray-400 p-2 outline-none focus:border-blue-500"
										value={form.epcEmail}
										onChange={(e) =>
											setField(
												"epcEmail",
												e.target.value,
											)
										}
										placeholder="EPC email"
									/>
								</div>

							</div>

							{/* Address */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									EPC Address
								</label>

								<textarea
									rows={3}
									className="w-full resize-none rounded-sm border border-gray-400 p-2 outline-none focus:border-blue-500"
									value={form.epcAddress}
									onChange={(e) =>
										setField(
											"epcAddress",
											e.target.value,
										)
									}
									placeholder="Enter EPC address"
								/>
							</div>

							{/* Modal Error */}
							{errorMessage && (
								<p className="text-sm text-red-500">
									{errorMessage}
								</p>
							)}
						</div>

						{/* Footer */}
						<div className="flex items-center justify-end gap-3 px-6 py-4">

							<button
								type="button"
								onClick={() =>
									setShowEpcModal(false)
								}
								className="rounded-sm border border-gray-400 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
							>
								Back
							</button>

							<button
								type="button"
								onClick={handleRegisterSubmit}
								disabled={register.isPending}
								className={`rounded-sm px-5 py-2 text-sm text-white ${
									register.isPending
										? "bg-gray-400 cursor-not-allowed"
										: "bg-blue-500 hover:bg-blue-600 cursor-pointer"
								}`}
							>
								{register.isPending
									? "Registering..."
									: "Complete Registration"}
							</button>

						</div>
					</div>
				</div>
			)}
		</>
	);
}