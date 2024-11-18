"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientIdForm({
  action,
}: {
  action: NonNullable<React.FormHTMLAttributes<HTMLFormElement>["action"]>;
}) {
  return (
    <form action={action}>
      <Label htmlFor="uid">用户 ID</Label>
      <Input
        type="number"
        id="uid"
        name="uid"
        placeholder="_uid"
        min={1}
        required
      />
      <Label htmlFor="clientId">Client ID</Label>
      <Input
        type="text"
        id="clientId"
        name="clientId"
        placeholder="__client_id"
        required
      />
      <Button type="submit">登录</Button>
    </form>
  );
}
