import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBanUser } from "@/hooks/useUsers";
import { Loader } from "lucide-react";
import type { User } from "@/lib/types";

interface BanDialogProps {
  banDialogOpen: boolean;
  selectedUser: User | null;
  setBanOpen: (open: boolean) => void;
  setSelectedUser: (user: User | null) => void;
}

function BanDialog({
  banDialogOpen,
  setBanOpen,
  selectedUser,
  setSelectedUser,
}: BanDialogProps) {
  const banUserMutation = useBanUser();

  const [banForm, setBanForm] = useState({
    reason: "",
    expiresIn: "7",
  });

  const handleBanUser = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const isPermanent = banForm.expiresIn === "permanent";

    const payload = {
      userId: selectedUser.id,
      banReason: banForm.reason || undefined,
      ...(isPermanent
        ? {}
        : { banExpiresIn: parseInt(banForm.expiresIn) * 24 * 60 * 60 }),
    };

    banUserMutation.mutate(payload, {
      onSuccess: () => {
        setBanOpen(false);
        setBanForm({ reason: "", expiresIn: "7" });
        setSelectedUser(null);
      },
    });
  };

  return (
    <Dialog
      open={banDialogOpen}
      onOpenChange={(open) => {
        if (!banUserMutation.isPending) {
          setBanOpen(open);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold text-base">
            Ban {selectedUser?.name} from accessing the system
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleBanUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Ban Reason (Optional)</Label>
            <Input
              id="reason"
              value={banForm.reason}
              onChange={(e) =>
                setBanForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Enter reason for ban..."
              disabled={banUserMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresIn">Ban Duration</Label>
            <Select
              value={banForm.expiresIn}
              onValueChange={(value) =>
                setBanForm((prev) => ({ ...prev, expiresIn: value }))
              }
              disabled={banUserMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBanOpen(false)}
              disabled={banUserMutation.isPending}
              className="w-1/3 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={banUserMutation.isPending}
              className="w-1/3 cursor-pointer bg-lipstick-red hover:bg-crimson-red text-white"
            >
              {banUserMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Banning...
                </span>
              ) : (
                "Ban User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BanDialog };
