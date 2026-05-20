package com.hundreddays.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

@CapacitorPlugin(name = "ForgeWidget")
public class ForgeWidgetPlugin extends Plugin {
    @PluginMethod
    public void saveOps(PluginCall call) {
        JSArray ops = call.getArray("ops");
        String status = call.getString("status", "low");
        if (ops == null) {
            call.reject("ops array is required");
            return;
        }

        SharedPreferences prefs = getContext().getSharedPreferences(ForgeOpsWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putString(ForgeOpsWidgetProvider.KEY_OPS, ops.toString())
            .putString(ForgeOpsWidgetProvider.KEY_STATUS, status)
            .apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(getContext());
        ComponentName component = new ComponentName(getContext(), ForgeOpsWidgetProvider.class);
        ForgeOpsWidgetProvider.updateWidgets(getContext(), manager, manager.getAppWidgetIds(component));
        call.resolve();
    }

    @PluginMethod
    public void getCompletedIds(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(ForgeOpsWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        JSArray ids = new JSArray();
        for (String id : prefs.getStringSet(ForgeOpsWidgetProvider.KEY_COMPLETED_IDS, java.util.Collections.emptySet())) {
            ids.put(id);
        }

        JSObject result = new JSObject();
        result.put("ids", ids);
        call.resolve(result);
    }

    @PluginMethod
    public void clearCompletedIds(PluginCall call) {
        getContext()
            .getSharedPreferences(ForgeOpsWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(ForgeOpsWidgetProvider.KEY_COMPLETED_IDS)
            .apply();
        call.resolve();
    }
}
