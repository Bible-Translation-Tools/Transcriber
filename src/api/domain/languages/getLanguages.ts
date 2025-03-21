// import type { LanguageOption } from "@src/components/LanguageDropdown";
// const query = `
// query MyQuery {
//   language {
//     code:ietf_code
//     anglicized:english_name
//     nationalName:national_name
//   }
// }
// `;

// export async function getLanguagesPublicDataApi() {
// 	const publicDataApiUrl = import.meta.env.VITE_PUBLIC_DATA_API_URL;
// 	try {
// 		const res = await fetch(publicDataApiUrl, {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify({
// 				query,
// 			}),
// 		});
// 		if (res.ok) {
// 			const data = await res.json();
// 			const languages = data.data.language;
// 			languages.sort((a: LanguageOption, b: LanguageOption) => {
// 				return a.anglicized.localeCompare(b.anglicized);
// 			});
// 			// set state call here:
// 			return languages as LanguageOption[];
// 		}
// 		throw new Error("Failed to fetch languages");
// 	} catch (error) {
// 		console.error("Error fetching languages:", error);
// 	}
// }
