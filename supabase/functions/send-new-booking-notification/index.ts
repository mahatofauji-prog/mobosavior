import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";
import webpush from "npm:web-push";

// VAPID keys fallback defaults for instant, out-of-the-box operation
const DEFAULT_VAPID_PUBLIC_KEY = "BJZ8rfRrKDAy2tCKAmb_lqGUVfXLOa3wEp90OQz20RnwxrSRjoss2WmaqTt-UIgUUW3OFJeOiT1o1kiBXJctjjc";
const DEFAULT_VAPID_PRIVATE_KEY = "Fs5tSK_UUEOw9oyBaN8pA68Tzl8fQfTOZEpiTJbC2dg";
const DEFAULT_VAPID_SUBJECT = "mailto:mahatofauji@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Create Supabase admin client that bypasses RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get VAPID configuration
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || DEFAULT_VAPID_SUBJECT;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || DEFAULT_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || DEFAULT_VAPID_PRIVATE_KEY;

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Parse incoming webhook / direct POST payload
    const body = await req.json().catch(() => ({}));
    const { type, record, passcode, subscription, device_label, user_agent } = body;

    console.log(`[Push Server] Received event type: ${type || "db_webhook_insert"}`);

    // --- 1. ADMIN TEST NOTIFICATION ---
    if (type === "test" && subscription) {
      console.log(`[Push Server] Sending direct test notification to endpoint: ${subscription.endpoint}`);
      try {
        const payloadObj = {
          title: "MOBO SAVIOR TEST NOTIFICATION",
          body: "New booking notification is working correctly.",
          tag: "test-notification",
          timestamp: Date.now(),
        };

        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh || subscription.keys?.p256dh,
            auth: subscription.auth || subscription.keys?.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(payloadObj));
        return new Response(JSON.stringify({ success: true, message: "Test notification sent successfully" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (err: any) {
        console.error(`[Push Server] Direct test notification failed:`, err);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // --- 2. ADMIN REGISTRATION FLOW ---
    if (type === "register" && passcode && subscription) {
      console.log(`[Push Server] Processing secure push registration...`);
      
      // A. Verify passcode
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "admin_auth")
        .maybeSingle();

      let isPasscodeValid = false;
      if (settingsData) {
        const authData = settingsData.data || settingsData.value || settingsData;
        if (authData && authData.password_hash && authData.salt) {
          // Verify SHA-512 PBKDF2 hash using Deno crypto to prevent external exposure of hashing logic
          const encoder = new TextEncoder();
          const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(passcode),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
          );
          
          // Legacy check or modern check. Salt hex to byte array
          const saltBytes = new Uint8Array(
            authData.salt.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
          );

          const derivedKey = await crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt: saltBytes,
              iterations: 10000,
              hash: "SHA-512",
            },
            keyMaterial,
            { name: "HMAC", hash: "SHA-512", length: 512 },
            true,
            ["sign", "verify"]
          );

          const exportedKey = await crypto.subtle.exportKey("raw", derivedKey);
          const computedHashHex = Array.from(new Uint8Array(exportedKey))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          if (computedHashHex === authData.password_hash) {
            isPasscodeValid = true;
          }
        }
      } else {
        // Default password check if settings row not set yet
        if (passcode === "Mobofounder@2026") {
          isPasscodeValid = true;
        }
      }

      if (!isPasscodeValid) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized: Invalid admin passcode." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      // B. Save subscription using service_role bypass client
      const dbPayload = {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || subscription.p256dh,
        auth: subscription.keys?.auth || subscription.auth,
        user_agent: user_agent || null,
        device_label: device_label || "Admin Device",
        is_active: true,
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      const { data: upsertData, error: upsertError } = await supabase
        .from("admin_push_subscriptions")
        .upsert(dbPayload, { onConflict: "endpoint" })
        .select()
        .single();

      if (upsertError) {
        console.error(`[Push Server] Subscription save error:`, upsertError);
        return new Response(JSON.stringify({ success: false, error: upsertError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Subscription registered successfully", data: upsertData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // --- 3. UNREGISTER FLOW ---
    if (type === "unregister" && subscription) {
      console.log(`[Push Server] Unregistering subscription: ${subscription.endpoint}`);
      const { error: deleteErr } = await supabase
        .from("admin_push_subscriptions")
        .delete()
        .eq("endpoint", subscription.endpoint);

      if (deleteErr) {
        console.error(`[Push Server] Unregister failed:`, deleteErr);
      }

      return new Response(JSON.stringify({ success: true, message: "Subscription unregistered" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // --- 4. NEW BOOKING AUTOMATIC NOTIFICATION EVENT ---
    // Handle both direct invocation and Supabase Webhook inserts
    const bookingRecord = record || body;
    const bookingId = bookingRecord?.service_id || bookingRecord?.id;

    if (!bookingId) {
      return new Response(JSON.stringify({ success: false, error: "No booking record or ID found in request" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify it is indeed a booking insertion event
    console.log(`[Push Server] Booking Event Detected: ID=${bookingId}, Customer=${bookingRecord?.customer_name || "Unknown"}`);

    // Fetch all active admin push subscriptions
    const { data: activeSubscriptions, error: dbError } = await supabase
      .from("admin_push_subscriptions")
      .select("*")
      .eq("is_active", true);

    if (dbError) {
      console.error(`[Push Server] Failed to fetch active subscriptions:`, dbError);
      return new Response(JSON.stringify({ success: false, error: dbError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      console.log(`[Push Server] No active registered admin devices found to receive push.`);
      return new Response(JSON.stringify({ success: true, message: "No active subscriptions found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[Push Server] Broadcasting push to ${activeSubscriptions.length} active admin device(s)...`);

    const payloadObj = {
      title: "NEW BOOKING RECEIVED",
      body: `New repair booking received. Open Admin Portal to view details.`,
      tag: `new-booking-${bookingId}`, // Idempotent tag so OS controls duplicates
      timestamp: Date.now(),
      data: {
        bookingId: bookingId,
        customerName: bookingRecord?.customer_name || bookingRecord?.customerName || "Customer",
        model: `${bookingRecord?.mobile_brand || ""} ${bookingRecord?.mobile_model || ""}`.trim() || "Device",
        url: "/moboadmin2026",
      },
    };

    const notificationPromises = activeSubscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payloadObj));
        
        // Update last used at timestamp
        await supabase
          .from("admin_push_subscriptions")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", sub.id);

        return { id: sub.id, success: true };
      } catch (pushErr: any) {
        console.warn(`[Push Server] Push delivery failed for subscription ID ${sub.id}:`, pushErr.message);
        
        // Handle expired/invalid push endpoints (410 Gone / 404 Not Found)
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          console.info(`[Push Server] Endpoint expired/invalid. Automatically removing subscription ID: ${sub.id}`);
          await supabase
            .from("admin_push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }

        return { id: sub.id, success: false, error: pushErr.message };
      }
    });

    const results = await Promise.all(notificationPromises);
    const successfulSends = results.filter(r => r.success).length;

    console.log(`[Push Server] Successfully delivered ${successfulSends}/${activeSubscriptions.length} notifications.`);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[Push Server] Top level exception:`, error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
