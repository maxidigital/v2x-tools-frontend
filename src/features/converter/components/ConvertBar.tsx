import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConverterStore } from '@/stores/useConverterStore';
import { useConvert } from '../hooks/useConvert';
import { FormatSelect } from './FormatSelect';

export function ConvertBar() {
  const { payload, outputFormat, setOutputFormat } = useConverterStore();
  const { run, isLoading } = useConvert();

  return (
    <div className="flex items-center gap-2">
      <FormatSelect value={outputFormat} onChange={setOutputFormat} label="to" />
      <Button size="sm" onClick={run} disabled={isLoading || !payload.trim()}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        Convert
      </Button>
    </div>
  );
}
