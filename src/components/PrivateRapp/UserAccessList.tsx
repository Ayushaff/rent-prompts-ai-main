"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

interface UsersListProps {
  users: User[];
  access?: any;
  isEditMode: boolean;
  handleCheckboxChange: (userId: string, action: "read" | "update") => void;
  setSelectedUsers: React.Dispatch<
    React.SetStateAction<{
      [userId: string]: { email: string; read: boolean; update: boolean };
    }>
  >;
  selectedUsers: {
    [userId: string]: { email: string; read: boolean; update: boolean };
  };
  handleAddMemberClick: () => void;
  isEditing: boolean;
}

function UsersAccessList({
  users,
  isEditMode,
  access,
  handleCheckboxChange,
  setSelectedUsers,
  selectedUsers,
  handleAddMemberClick, // Receive the prop
  isEditing, // Receive the editing state
}: UsersListProps) {
  // State to store checkbox status per user (read, update)
  //   const [selectedUsers, setSelectedUsers] = useState<{
  //     [userId: string]: { email: string; read: boolean; update: boolean }
  //   }>({})

  const [isSending, setIsSending] = useState(false);

  // Initialize selectedUsers from access on component mount or access changes
  useEffect(() => {
    const initialSelectedUsers = access.reduce((acc, accessItem) => {
      acc[accessItem.userId.id] = {
        email: accessItem.userId.email,
        read: accessItem.getAccess.includes("read"),
        update: accessItem.getAccess.includes("update"),
      };
      return acc;
    }, {} as { [userId: string]: { email: string; read: boolean; update: boolean } });
    setSelectedUsers(initialSelectedUsers);
  }, [access]);

  // Function to send invitations
  const sendInvitations = useCallback(async () => {
    const selectedToAccess = Object.keys(selectedUsers).filter(
      (userId) => selectedUsers[userId].read || selectedUsers[userId].update
    );

    if (selectedToAccess.length === 0) {
      toast.error("Please select at least one user to send an invitation.");
      return;
    }

    const selectedUserEmails = selectedToAccess.map(
      (userId) => selectedUsers[userId].email
    );
    // console.log('selectedUserEmails', selectedUserEmails)
    setIsSending(true);
    try {
      for (const email of selectedUserEmails) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch("/api/sendPrivateRappsAccess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
          toast.success(`Invitation sent to ${email}`);
        } else {
          toast.error(`Failed to send invitation to ${email}`);
        }
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("An error occurred while sending invitations.");
    } finally {
      setIsSending(false);
    }
  }, [selectedUsers]);

  const renderRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const user = users[index];
      const userAccess = selectedUsers[user.id] || {
        read: false,
        update: false,
      };

      return (
        <div
          style={style}
          className="flex items-center border-b border-gray-700 hover:bg-indigo-600 cursor-pointer transition-colors"
        >
          <div className="w-1/12 p-2 text-center text-gray-100 text-xs md:text-sm">
            {index + 1}
          </div>
          <div className="w-7/12 md:w-7/12 p-2 text-gray-100 text-xs md:text-sm">
            {user.email}
          </div>

          <div className="flex w-4/12 md:w-4/12 justify-around items-center space-x-2">
            <div className="w-1/2 flex justify-center items-center">
              <Checkbox
                checked={selectedUsers[user.id]?.read || false}
                disabled={!isEditMode}
                onCheckedChange={() => handleCheckboxChange(user.id, "read")}
                className="border-white"
              />
            </div>
            <div className="w-1/2 flex justify-center items-center">
              <Checkbox
                checked={selectedUsers[user.id]?.update || false}
                disabled={!isEditMode}
                onCheckedChange={() => handleCheckboxChange(user.id, "update")}
                className="border-white"
              />
            </div>
          </div>
        </div>
      );
    },
    [users, selectedUsers, handleCheckboxChange, isEditMode]
  );
  const listHeight = users.length > 5 ? 400 : users.length * 60; // Adjust height based on the number of users

  return (
    <div className="container mt-0 max-w-full mx-auto p-6 bg-indigo-700 shadow-lg rounded-lg overflow-hidden select-none">
      <div className="pb-5 flex justify-between ">
        <div>
          <div className="flex flex-row items-center gap-2">
            <CheckCircle className="h-5 w-5" />

            <h2 className="md:text-2xl font-bold text-white">
              Users Access List
            </h2>
          </div>
          <p className="text-xs md:text-sm text-gray-100 mt-1">
            User with Access on this Rapp
          </p>
        </div>
        <Button onClick={handleAddMemberClick}
          disabled={isEditing} variant="blue">Add Member</Button>
      </div>

      {
        users.length > 0 && 
        <>
        <div className="overflow-x-auto">
        <div className="flex items-center bg-indigo-800 p-2">
          <div className="w-1/12 text-xs md:text-sm text-center font-semibold text-gray-200">
            #
          </div>
          <div className="w-7/12 font-semibold text-gray-200 text-xs md:text-sm">
            Email
          </div>
          <div className="w-2/12 text-center font-semibold text-gray-200 text-xs md:text-sm">
            Read
          </div>
          <div className="w-2/12 text-center font-semibold text-gray-200 text-xs md:text-sm">
            Update
          </div>
        </div>       
        <List
          height={listHeight}
          itemCount={users.length}
          itemSize={60}
          width="100%"
        >
          {renderRow}
        </List>
      </div> 

      <div className="p-6 flex justify-between items-center border-t border-gray-700 bg-indigo-600">
        <p className="text-sm text-gray-100">
          {Object?.values(selectedUsers).filter((user) => user.read).length}{" "}
          user
          {Object?.values(selectedUsers).filter((user) => user.read).length !==
          1
            ? "s"
            : ""}{" "}
          selected
        </p>
        <Button
          onClick={sendInvitations}
          disabled={
            Object?.values(selectedUsers).filter((user) => user.read).length ===
            0 ||
            isSending ||
            !isEditMode
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
          {isSending ? "Sending Invitations..." : `Send Invitations`}
        </Button>
      </div>
      </>
        }
    </div>
  );
}

export default React.memo(UsersAccessList);
