import { getAllSessionsData, getAppData } from "@/lib/kv";
import { buildDefaultAllSessionsData, migrateToAllSessionsData } from "@/lib/constants";
import SessionTabs from "@/components/SessionTabs";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data;
  try {
    const sessions = await getAllSessionsData();
    if (sessions?.sessions) {
      data = sessions;
    } else {
      const legacy = await getAppData();
      data = legacy ? migrateToAllSessionsData(legacy) : buildDefaultAllSessionsData();
    }
  } catch {
    data = buildDefaultAllSessionsData();
  }

  return <SessionTabs initialData={data} />;
}
