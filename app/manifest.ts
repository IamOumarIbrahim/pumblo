import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pumblo - Film pages for AI motion creators",
    short_name: "Pumblo",
    description:
      "Publish an AI film with its tools, workflow, license, creator profile, and feedback attached.",
    start_url: "/",
    display: "standalone",
    background_color: "#090a0c",
    theme_color: "#b8ff3d",
  };
}
