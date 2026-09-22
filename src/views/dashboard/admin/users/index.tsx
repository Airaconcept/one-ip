import { ResourcePage } from "@/components/resource-page";
import { config } from "./config";
import type { PageProps } from "../types";

export default function Page({ user }: PageProps) {
  return <ResourcePage config={config} user={user} />;
}
