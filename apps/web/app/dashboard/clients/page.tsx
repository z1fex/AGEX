"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Plus, MessageSquare, Building2, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";

interface Client {
  slug: string;
  name: string;
  onboardedAt: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function ClientsPage() {
  const router = useRouter();
  const { newThread } = useChatStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleOnboard = () => {
    const threadId = newThread("Client Onboarding");
    router.push(
      `/dashboard/chat?run=${encodeURIComponent("I want to onboard a new client. Ask me about the company, their brand voice, target audience, goals, and competitors.")}`
    );
  };

  const handleClientChat = (client: Client) => {
    const threadId = newThread(client.name, client.slug);
    router.push(
      `/dashboard/chat?run=${encodeURIComponent(`Let's work on ${client.name}. What should we do next?`)}`
    );
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Clients</h2>
          <p className="mt-1 text-[rgb(116,116,116)]">
            {loading
              ? "Loading..."
              : clients.length === 0
              ? "No clients yet. Onboard your first one."
              : `${clients.length} client${clients.length > 1 ? "s" : ""} onboarded.`}
          </p>
        </div>
        <Button onClick={handleOnboard} className="gap-2">
          <Plus className="h-4 w-4" />
          Onboard Client
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[rgb(116,116,116)]" />
        </div>
      ) : clients.length === 0 ? (
        <motion.div variants={fadeUp}>
          <Card glass className="p-12">
            <div className="flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-[rgb(50,50,50)]" />
              <h3 className="mt-4 text-lg font-semibold text-white">No clients yet</h3>
              <p className="mt-2 max-w-sm text-sm text-[rgb(116,116,116)]">
                Onboard your first client through the chat. Tell AGEX about the
                company and it will create the client profile.
              </p>
              <Button onClick={handleOnboard} variant="outline" className="mt-6 gap-2">
                <MessageSquare className="h-4 w-4" />
                Start Onboarding
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <motion.div key={client.slug} variants={fadeUp}>
              <Card
                glass
                className="group cursor-pointer transition-all hover:scale-[1.01] hover:border-white/10"
                onClick={() => handleClientChat(client)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{client.name}</h3>
                  </div>
                  {client.onboardedAt && (
                    <div className="flex items-center gap-2 text-xs text-[rgb(116,116,116)]">
                      <Calendar className="h-3 w-3" />
                      Onboarded {client.onboardedAt}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
