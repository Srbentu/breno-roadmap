import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status page</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let updatedText = "Loading...";
  if (!isLoading && data) {
    updatedText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div>Last Update: {updatedText} </div>;
}
function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let dbStatus = "Loading...";
  if (!isLoading && data) {
    const dbInfo = data.dependnencies.database;
    dbStatus = (
      <ul>
        <li>Postgres Version: {dbInfo.postgress_version}</li>
        <li>Max Connections: {dbInfo.max_connections}</li>
        <li>Opened Connections: {dbInfo.opened_connections}</li>
      </ul>
    );
  }
  return (
    <div>
      <h2>Database Status</h2>
      {dbStatus}
    </div>
  );
}
