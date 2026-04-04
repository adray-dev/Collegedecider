import { getAppData } from "@/lib/kv";
import { buildDefaultAppData } from "@/lib/constants";
import ScenarioTabs from "@/components/ScenarioTabs";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data;
  try {
    data = (await getAppData()) ?? buildDefaultAppData();
  } catch {
    data = buildDefaultAppData();
  }

  return <ScenarioTabs initialData={data} />;
}
