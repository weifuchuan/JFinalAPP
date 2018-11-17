package com.jfinal.nativemodule;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NotificationOpener extends ReactContextBaseJavaModule {
    public NotificationOpener(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NotificationOpener";
    }

    @ReactMethod
    public void isOpened(Promise promise) {
        NotificationManagerCompat manager = NotificationManagerCompat.from(this.getReactApplicationContext());
        boolean isOpened = manager.areNotificationsEnabled();
        promise.resolve(isOpened);
    }

    @ReactMethod
    public void openIfNotOpened() {
        NotificationManagerCompat manager = NotificationManagerCompat.from(this.getReactApplicationContext());
        boolean isOpened = manager.areNotificationsEnabled();
        if (!isOpened) {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", this.getReactApplicationContext().getPackageName(), null);
            intent.setData(uri);
            ContextCompat.startActivity(this.getReactApplicationContext(), intent, null);
        }
    }
}
