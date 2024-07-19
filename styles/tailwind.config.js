/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["_site/**/*.html"],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#d300ff",
					secondary: "#42cd00",
					accent: "#00a0ff",
					neutral: "#0f0d1b",
					"base-100": "#e8fdff",
					info: "#00d3ff",
					success: "#00f4ad",
					warning: "#e10000",
					error: "#ef0d5a",
				},
			},
		],
	},
};
