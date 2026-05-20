import { Capacitor, registerPlugin } from '@capacitor/core';
import type { OpsWidgetItem } from '@/components/OpsWidget';

interface ForgeWidgetPlugin {
    saveOps(options: { ops: OpsWidgetItem[]; status: 'strong' | 'steady' | 'low' }): Promise<void>;
    getCompletedIds(): Promise<{ ids: string[] }>;
    clearCompletedIds(): Promise<void>;
}

const ForgeWidget = registerPlugin<ForgeWidgetPlugin>('ForgeWidget');

export const widgetBridge = {
    async saveOps(ops: OpsWidgetItem[], status: 'strong' | 'steady' | 'low') {
        if (!Capacitor.isNativePlatform()) return;
        await ForgeWidget.saveOps({
            ops: ops.slice(0, 6).map((item) => ({
                ...item,
                title: item.title.length > 28 ? `${item.title.slice(0, 25)}...` : item.title,
            })),
            status,
        });
    },

    async consumeCompletedIds(): Promise<string[]> {
        if (!Capacitor.isNativePlatform()) return [];
        const result = await ForgeWidget.getCompletedIds();
        await ForgeWidget.clearCompletedIds();
        return result.ids ?? [];
    },
};
