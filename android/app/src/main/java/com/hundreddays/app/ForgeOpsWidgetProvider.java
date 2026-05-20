package com.hundreddays.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

public class ForgeOpsWidgetProvider extends AppWidgetProvider {
    public static final String PREFS_NAME = "forge_widget";
    public static final String KEY_OPS = "ops";
    public static final String KEY_STATUS = "status";
    public static final String KEY_COMPLETED_IDS = "completed_ids";
    private static final String ACTION_TOGGLE = "com.hundreddays.app.widget.TOGGLE";
    private static final String EXTRA_OP_ID = "op_id";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateWidgets(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_TOGGLE.equals(intent.getAction())) {
            String opId = intent.getStringExtra(EXTRA_OP_ID);
            if (opId != null) {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                Set<String> completed = new HashSet<>(prefs.getStringSet(KEY_COMPLETED_IDS, new HashSet<>()));
                if (completed.contains(opId)) {
                    completed.remove(opId);
                } else {
                    completed.add(opId);
                }
                prefs.edit().putStringSet(KEY_COMPLETED_IDS, completed).apply();
                AppWidgetManager manager = AppWidgetManager.getInstance(context);
                ComponentName component = new ComponentName(context, ForgeOpsWidgetProvider.class);
                updateWidgets(context, manager, manager.getAppWidgetIds(component));
            }
        }
    }

    public static void updateWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            appWidgetId,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.forge_ops_widget);
        views.setOnClickPendingIntent(R.id.forge_widget_root, pendingIntent);
        views.setOnClickPendingIntent(R.id.forge_widget_button, pendingIntent);
        bindData(context, views);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static void bindData(Context context, RemoteViews views) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        Set<String> completed = prefs.getStringSet(KEY_COMPLETED_IDS, new HashSet<>());
        String status = prefs.getString(KEY_STATUS, "low");
        int[] chipIds = {
            R.id.forge_widget_chip_1,
            R.id.forge_widget_chip_2,
            R.id.forge_widget_chip_3,
            R.id.forge_widget_chip_4,
            R.id.forge_widget_chip_5,
            R.id.forge_widget_chip_6
        };

        views.setTextViewText(R.id.forge_widget_pet_face, "low".equals(status) ? "-_-" : ("steady".equals(status) ? "o_o" : "^_^"));
        views.setTextViewText(R.id.forge_widget_pet_line, "low".equals(status) ? "Start tiny" : ("steady".equals(status) ? "One more" : "Keep going"));

        try {
            JSONArray ops = new JSONArray(prefs.getString(KEY_OPS, "[]"));
            int count = Math.min(chipIds.length, ops.length());
            for (int i = 0; i < chipIds.length; i++) {
                if (i < count) {
                    JSONObject op = ops.getJSONObject(i);
                    String id = op.optString("id", "");
                    String title = op.optString("title", "Daily op");
                    boolean isDone = op.optBoolean("completed", false) || completed.contains(id);
                    views.setTextViewText(chipIds[i], (isDone ? "✓ " : "□ ") + title);
                    views.setInt(chipIds[i], "setBackgroundResource", isDone ? R.drawable.forge_widget_chip_done : R.drawable.forge_widget_chip_pending);

                    Intent toggleIntent = new Intent(context, ForgeOpsWidgetProvider.class);
                    toggleIntent.setAction(ACTION_TOGGLE);
                    toggleIntent.putExtra(EXTRA_OP_ID, id);
                    PendingIntent togglePendingIntent = PendingIntent.getBroadcast(
                        context,
                        1000 + i,
                        toggleIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    views.setOnClickPendingIntent(chipIds[i], togglePendingIntent);
                } else {
                    views.setTextViewText(chipIds[i], "");
                    views.setInt(chipIds[i], "setBackgroundResource", R.drawable.forge_widget_chip_empty);
                }
            }
            views.setTextViewText(R.id.forge_widget_count, count + "/6");
        } catch (Exception ex) {
            views.setTextViewText(R.id.forge_widget_chip_1, "Open Forge to sync ops");
            for (int i = 1; i < chipIds.length; i++) {
                views.setTextViewText(chipIds[i], "");
            }
            views.setTextViewText(R.id.forge_widget_count, "0/6");
        }
    }
}
