import TopNav from "@/components/TopNav";
import RoomPreview from "@/components/RoomPreview";
import SidePanel from "@/components/SidePanel";

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <TopNav />
      <div className="flex-1 flex overflow-hidden">
        <RoomPreview />
        <SidePanel />
      </div>
    </div>
  );
};

export default Index;
