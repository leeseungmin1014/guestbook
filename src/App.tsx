import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  insertGuestbookEntry,
  listGuestbookEntries,
} from "./services/guestbookService";
import { signInWithGoogle, signOut } from "./services/authService";
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
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 세션 초기화 및 구독
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 초기 데이터 로딩
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
      subscription.unsubscribe();
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
        <div className="app__auth">
          {session ? (
            <div className="auth-info">
              <span className="auth-info__user">
                {session.user.user_metadata.full_name}님 안녕하세요!
              </span>
              <button className="auth-info__button" onClick={signOut}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className="auth-info__button" onClick={signInWithGoogle}>
              구글로 로그인
            </button>
          )}
        </div>
        <h1 className="app__title">방명록</h1>
        <p className="app__subtitle">이름과 한마디를 남겨 주세요.</p>
      </header>

      <main className="app__main">
        <GuestbookForm onSubmit={handleAdd} user={session?.user} />
        <GuestbookList entries={entries} loading={loading} />
      </main>
    </div>
  );
}
