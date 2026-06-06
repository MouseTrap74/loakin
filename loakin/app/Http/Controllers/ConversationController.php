<?php

namespace App\Http\Controllers;

use App\Models\BlockedUser;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /** GET /conversations */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('participant_one_id', $userId)
            ->orWhere('participant_two_id', $userId)
            ->with([
                'participantOne:id,name,photo',
                'participantTwo:id,name,photo',
                'latestMessage',
                'listing:id,title',
            ])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conv) use ($userId) {
                $other = $conv->otherParticipant($userId);
                return [
                    'id'              => $conv->id,
                    'listing'         => $conv->listing,
                    'other_user'      => [
                        'id'        => $other->id,
                        'name'      => $other->name,
                        'photo_url' => $other->photo
                            ? asset('storage/' . $other->photo)
                            : null,
                    ],
                    'latest_message'  => $conv->latestMessage,
                    'unread_count'    => $conv->unreadCountFor($userId),
                    'last_message_at' => $conv->last_message_at,
                ];
            });

        return response()->json(['data' => $conversations]);
    }

    /** POST /conversations — create or fetch existing conversation */
    public function store(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|integer|exists:users,id',
            'listing_id'   => 'nullable|integer|exists:listings,id',
        ]);

        $authId      = $request->user()->id;
        $recipientId = (int) $request->recipient_id;

        if ($authId === $recipientId) {
            return response()->json(['message' => 'Tidak bisa chat dengan diri sendiri.'], 422);
        }

        // Respect the block system — check both directions
        $isBlocked = BlockedUser::where(function ($q) use ($authId, $recipientId) {
            $q->where('user_id', $authId)->where('blocked_id', $recipientId);
        })->orWhere(function ($q) use ($authId, $recipientId) {
            $q->where('user_id', $recipientId)->where('blocked_id', $authId);
        })->exists();

        if ($isBlocked) {
            return response()->json(['message' => 'Tidak dapat mengirim pesan ke pengguna ini.'], 403);
        }

        // Canonical ordering: smaller ID always in participant_one
        [$p1, $p2] = $authId < $recipientId
            ? [$authId, $recipientId]
            : [$recipientId, $authId];

        $conversation = Conversation::firstOrCreate(
            ['participant_one_id' => $p1, 'participant_two_id' => $p2],
            ['listing_id' => $request->listing_id, 'last_message_at' => now()]
        );

        if ($request->has('listing_id')) {
            $conversation->update(['listing_id' => $request->listing_id]);
        }

        $conversation->load([
            'participantOne:id,name,photo',
            'participantTwo:id,name,photo',
            'listing:id,title',
        ]);

        return response()->json(['data' => $conversation], 201);
    }

    /** GET /conversations/{id} */
    public function show(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('participant_one_id', $userId)
              ->orWhere('participant_two_id', $userId);
        })
        ->with([
            'participantOne:id,name,photo',
            'participantTwo:id,name,photo',
            'listing:id,title,status',
            'listing.primaryPhoto',
            'messages.sender:id,name,photo',
            'messages.listing:id,title,price,status',
            'messages.listing.primaryPhoto',
        ])
        ->findOrFail($id);

        // Map photo paths to full URLs so frontend doesn't need to construct them
        $conversation->participantOne->photo_url = $conversation->participantOne->photo
            ? asset('storage/' . $conversation->participantOne->photo)
            : null;
        $conversation->participantTwo->photo_url = $conversation->participantTwo->photo
            ? asset('storage/' . $conversation->participantTwo->photo)
            : null;

        if ($conversation->listing) {
            $conversation->listing->primary_photo_url = $conversation->listing->primaryPhoto
                ? asset('storage/' . $conversation->listing->primaryPhoto->photo_path)
                : null;
        }

        // Map sender photo URLs in messages and listing primary photo URLs
        $conversation->messages->each(function ($msg) {
            if ($msg->sender) {
                $msg->sender->photo_url = $msg->sender->photo
                    ? asset('storage/' . $msg->sender->photo)
                    : null;
            }
            if ($msg->listing) {
                $msg->listing->primary_photo_url = $msg->listing->primaryPhoto
                    ? asset('storage/' . $msg->listing->primaryPhoto->photo_path)
                    : null;
            }
        });

        // Mark all incoming unread messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['data' => $conversation]);
    }
}