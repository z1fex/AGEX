"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Plus, MessageSquare, Building2, Globe, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  industry: string;
  website: string;
  onboardedAt: string;
}

const CLIENTS_KEY = "agency-clients";

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
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CLIENTS_KEY) || "[]");
      setClients(saved);
    } catch {}
  }, []);

  const handleOnboard = () => {
    router.push(
      `/dashboard/chat?run=${encodeURIComponent("I want to onboard a new client. Ask me the questions.")}`
    );
  };

  const handleClientChat = (name: string) => {
    router.push(
      `/dashboard/chat?run=${encodeURIComponent(`Let's work on the client "${name}". What should we do next?`)}`
    );
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Clients</h2>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            {clients.length === 0
              ? "No clients yet. Onboard your first one through the chat."
              : `${clients.length} client${clients.length > 1 ? "s" : ""} onboarded.`}
          </p>
        </div>
        <Button onClick={handleOnboard} className="gap-2">
          <Plus className="h-4 w-4" />
          Onboard Client
        </Button>
      </motion.div>

      {clients.length === 0 ? (
        /* Empty state */
        <motion.div variants={fadeUp}>
          <Card glass className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] mb-4">
                <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                No clients yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
                Onboard your first client through the chat. Tell the agency about the
                company, their brand voice, target audience, and goals.
              </p>
              <Button onClick={handleOnboard} className="mt-6 gap-2">
                <MessageSquare className="h-4 w-4" />
                Start Onboarding in Chat
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* Client list */
        <motion.div variants={stagger} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <motion.div key={client.id} variants={fadeUp}>
              <Card
                glass
                className="group cursor-pointer transition-all hover:scale-[1.01] hover:border-[hsl(var(--primary)/0.3)]"
                onClick={() => handleClientChat(client.name)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                      <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {client.name}
                      </h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {client.industry}
                      </p>
                    </div>
                  </div>
                  {client.website && (
                    <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <Globe className="h-3 w-3" />
                      {client.website}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <Calendar className="h-3 w-3" />
                    Onboarded {client.onboardedAt}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
