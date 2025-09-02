import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("inserted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { title, category } = await req.json();

  if (!title)
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ title, user_id: user.id, category }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, title, completed, category } = await req.json();

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("tasks")
    .update({ title, completed, category })
    .eq("id", id)
    .eq("user_id", user.id) // ✅ user can edit only their own tasks
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();

  if (!id)
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id) // ✅ ensures users can delete only their own task
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(
    { message: "Task deleted successfully", deleted: data },
    { status: 200 }
  );
}
