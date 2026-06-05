<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

/*
 * Each user subscribes to their own private channel for personal notifications.
 */
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

/*
 * Only the two participants of a conversation may subscribe to its channel.
 */
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;

    return in_array((int) $user->id, [
        (int) $conversation->participant_one_id,
        (int) $conversation->participant_two_id,
    ]);
});