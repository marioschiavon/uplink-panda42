import { useEffect, useState } from "react";
import { Users, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useSessionsStore } from "@/store/sessions";
import { contactsApi, Contact } from "@/api/contacts";
import { groupsApi, Group } from "@/api/groups";
import { ContactList } from "@/components/contacts/ContactList";
import { GroupList } from "@/components/contacts/GroupList";
import { CreateGroupDialog } from "@/components/contacts/CreateGroupDialog";

export default function Contacts() {
  const sessions = useSessionsStore((state) => state.sessions);
  
  // Find first connected session
  const activeSessionName = Object.keys(sessions).find(
    (key) => sessions[key]?.status === "connected"
  );
  const activeSession = activeSessionName ? { name: activeSessionName } : null;
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const loadContacts = async () => {
    if (!activeSession) return;
    
    setIsLoadingContacts(true);
    try {
      const data = await contactsApi.list(activeSession.name);
      setContacts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar a lista de contatos",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadGroups = async () => {
    if (!activeSession) return;
    
    setIsLoadingGroups(true);
    try {
      const data = await groupsApi.list(activeSession.name);
      setGroups(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar grupos",
        description: "Não foi possível carregar a lista de grupos",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (activeSession) {
      loadContacts();
      loadGroups();
    }
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contatos e Grupos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus contatos e grupos do WhatsApp
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma sessão conectada. Conecte uma sessão para ver seus contatos e grupos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contatos e Grupos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus contatos e grupos do WhatsApp
          </p>
        </div>
        <CreateGroupDialog 
          sessionName={activeSession.name} 
          onGroupCreated={loadGroups}
        />
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">
            <UserCircle className="h-4 w-4 mr-2" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Grupos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Contatos</CardTitle>
              <CardDescription>
                {contacts.length} contatos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactList 
                contacts={contacts} 
                isLoading={isLoadingContacts}
                sessionName={activeSession.name}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Grupos</CardTitle>
              <CardDescription>
                {groups.length} grupos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GroupList 
                groups={groups} 
                isLoading={isLoadingGroups}
                sessionName={activeSession.name}
                onUpdate={loadGroups}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
