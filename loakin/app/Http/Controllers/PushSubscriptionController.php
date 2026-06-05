<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /** POST /push/subscribe — Web Push (browser + mobile PWA) */
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint'    => 'required|string',
            'p256dh'      => 'required|string',
            'auth_token'  => 'required|string',
            'device_type' => 'nullable|in:web,android,ios',
        ]);

        PushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'user_id'     => $request->user()->id,
                'p256dh'      => $request->p256dh,
                'auth_token'  => $request->auth_token,
                'device_type' => $request->device_type ?? 'web',
            ]
        );

        return response()->json(['message' => 'Subscribed.'], 201);
    }

    /** DELETE /push/unsubscribe */
    public function unsubscribe(Request $request)
    {
        $request->validate(['endpoint' => 'required|string']);

        PushSubscription::where('endpoint', $request->endpoint)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Unsubscribed.']);
    }

    /**
     * POST /push/fcm-token
     * Flutter will call this once it has an FCM/APNs token.
     * Web does not call this endpoint.
     */
    public function storeFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token'   => 'required|string',
            'device_type' => 'required|in:android,ios',
        ]);

        PushSubscription::updateOrCreate(
            ['fcm_token' => $request->fcm_token],
            [
                'user_id'     => $request->user()->id,
                'endpoint'    => 'fcm://' . $request->fcm_token,
                'p256dh'      => '',
                'auth_token'  => '',
                'device_type' => $request->device_type,
                'fcm_token'   => $request->fcm_token,
            ]
        );

        return response()->json(['message' => 'FCM token stored.'], 201);
    }
}