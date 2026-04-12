import TopNav from "@/components/TopNav";
import RoomPreview from "@/components/RoomPreview";
import SidePanel from "@/components/SidePanel";
import { useRoomPlanner } from "@/features/room-planner/useRoomPlanner";

const Index = () => {
  const planner = useRoomPlanner();
  return (
    <div className="h-dvh min-h-screen flex flex-col bg-background">
      <TopNav />
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <RoomPreview planner={planner} />
        <SidePanel planner={planner} />
      </div>
    </div>
  );
};

export default Index;
