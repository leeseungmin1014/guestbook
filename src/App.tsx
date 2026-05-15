import { useCallback, useEffect, useState } from "react";
import {
  insertGuestbookEntry,
  listGuestbookEntries,
} from "./services/guestbookService";
import type {
  GuestbookEntry,
  GuestbookInsertPayload,
} from "./types/guestbook";
import GuestbookForm from "./components/GuestbookForm";
import GuestbookList from "./components/GuestbookList";
import "./App.css";

export default function App() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listGuestbookEntries()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = useCallback(
    async (payload: GuestbookInsertPayload) => {
      const entry = await insertGuestbookEntry(payload);
      if (entry) {
        setEntries((prev) => [entry, ...prev]);
      }
    },
    []
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">방명록</h1>
        <p className="app__subtitle">이름과 한마디를 남겨 주세요.</p>
      </header>

      <main className="app__main">
        <GuestbookForm onSubmit={handleAdd} />
        <GuestbookList entries={entries} loading={loading} />
      </main>
    </div>
  );
}
