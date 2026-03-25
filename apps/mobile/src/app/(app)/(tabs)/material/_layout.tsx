import { MaterialTabButton, MaterialTabList } from '@/features/material/components/material-tab-bar';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

export default function MaterialLayout() {
    return (
        <Tabs className='bg-background flex-col'>
            <TabList asChild>
                <MaterialTabList>
                    <TabTrigger asChild name="premise" href="/material/premise">
                        <MaterialTabButton variant="premise" />
                    </TabTrigger>
                    <TabTrigger asChild name="bit" href="/material/bit">
                        <MaterialTabButton variant="bit" />
                    </TabTrigger>
                    <TabTrigger asChild name="setlist" href="/material/setlist">
                        <MaterialTabButton variant="set" />
                    </TabTrigger>
                </MaterialTabList>
            </TabList>
            <TabSlot />
        </Tabs>
    )
}
