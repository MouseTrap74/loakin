<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserNotified;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    /** POST /conversations/{id}/messages */
    public function store(Request $request, int $conversationId)
    {
        $request->validate([
            'body'  => 'nullable|string|max:2000',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'include_listing' => 'nullable|boolean',
        ]);

        if (!$request->body && !$request->hasFile('photo') && !$request->boolean('include_listing')) {
            return response()->json(['message' => 'Pesan tidak boleh kosong.'], 422);
        }

        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('participant_one_id', $userId)
              ->orWhere('participant_two_id', $userId);
        })->findOrFail($conversationId);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('message-photos', 'public');
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $userId,
            'listing_id'      => $request->boolean('include_listing') ? $conversation->listing_id : null,
            'body'            => $request->body,
            'photo_path'      => $photoPath,
        ]);

        $conversation->update(['last_message_at' => now()]);
        $message->load('sender:id,name,photo', 'listing.primaryPhoto');

        if ($message->listing) {
            $message->listing->primary_photo_url = $message->listing->primaryPhoto
                ? asset('storage/' . $message->listing->primaryPhoto->photo_path)
                : null;
        }

        // 1. Broadcast to the conversation channel (real-time chat)
        broadcast(new MessageSent($message))->toOthers();

        // 2. Notify the recipient
        $recipientId = $conversation->participant_one_id === $userId
            ? $conversation->participant_two_id
            : $conversation->participant_one_id;

        $recipient = User::find($recipientId);
        if ($recipient) {
            // Persist to DB (queued)
            $recipient->notify(new NewMessageNotification($message));

            // Broadcast to recipient's personal channel — bell updates instantly
            broadcast(new UserNotified($recipientId, [
                'type'            => 'new_message',
                'conversation_id' => $conversation->id,
                'sender_name'     => $request->user()->name,
                'preview'         => $message->body
                    ? Str::limit($message->body, 60)
                    : '📷 Foto',
            ]));
        }

        return response()->json(['data' => $message], 201);
    }

    /** PATCH /conversations/{id}/read */
    public function markRead(Request $request, int $conversationId)
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('participant_one_id', $userId)
              ->orWhere('participant_two_id', $userId);
        })->findOrFail($conversationId);

        $updated = $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['updated' => $updated]);
    }
}