module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme:   {
		extend: {
			backgroundImage: {
				'yojimbo': "url('/src/assets/images/bg.png')",
				'yojimbo-mobile': "url('/src/assets/images/bg-mobile.png')",
			}
		},
	},
	plugins: [],
}