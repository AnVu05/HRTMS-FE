const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'admin', 'Races.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const oldDialogStart = unction AddRaceDialog({ tournamentId }) {;
const oldDialogEnd =           <DialogFooter>
            <Button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">Save Race</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const newDialogDef = unction RaceFormDialog({ mode = 'add', initialData = null, tournamentId, trigger }) {
  const isEdit = mode === 'edit';
  
  const formatDateForForm = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return \\/\/\\;
    }
    return dateStr;
  };

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      tournamentId: tournamentId || initialData?.tournament_id || initialData?.tournamentId,
      date: formatDateForForm(initialData?.date),
      startTime: initialData?.startTime || initialData?.start_time || '',
      endTime: initialData?.endTime || initialData?.end_time || '',
      distanceM: initialData?.distanceM || initialData?.distance_m || '',
      numHorse: initialData?.numHorse || initialData?.num_horse || '',
      refereeId: initialData?.refereeId?.toString() || initialData?.referee?.id?.toString() || '',
      status: initialData?.status || 'PENDING_REFEREE',
      raceRulesId: initialData?.raceRulesId?.toString() || initialData?.raceRules?.id?.toString() || '',
      expectedDurationMinutes: initialData?.expectedDurationMinutes || initialData?.expected_duration_minutes || '',
      breakTimeMinutes: initialData?.breakTimeMinutes || initialData?.break_time_minutes || '',
      canceledAt: initialData?.canceledAt || new Date().toISOString()
    }
  });

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: formats = [] } = useQuery({ queryKey: ['raceFormats'], queryFn: adminApi.getRaceFormats });
  const { data: referees = [] } = useQuery({ queryKey: ['referees'], queryFn: adminApi.getReferees });

  const mutationFn = isEdit ? (data) => adminApi.updateRace(initialData.id, data) : (data) => adminApi.createRace(data);

  const saveMutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries(['races', tournamentId]);
      setIsOpen(false);
    },
    onError: (error) => {
      console.error(\Failed to \ race:\, error);
    }
  });

  const onSubmit = (data) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const [dd, mm, yyyy] = dateStr.split('/');
      return \\-\-\\;
    };

    const payload = {
      name: data.name,
      tournament_id: data.tournamentId,
      date: formatDate(data.date),
      start_time: data.startTime + (data.startTime && data.startTime.length === 5 ? ":00" : ""),
      end_time: data.endTime + (data.endTime && data.endTime.length === 5 ? ":00" : ""),
      distance_m: data.distanceM,
      num_horse: data.numHorse,
      referee_id: data.refereeId,
      status: data.status,
      race_rules_id: data.raceRulesId,
      expected_duration_minutes: data.expectedDurationMinutes,
      break_time_minutes: data.breakTimeMinutes
    };

    saveMutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Update Race' : 'Add New Race'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <input type="hidden" {...register("tournamentId")} />
          <input type="hidden" {...register("status")} />
          <input type="hidden" {...register("canceledAt")} />
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" className="col-span-3" {...register("name", { required: true })} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <div className="col-span-3">
              <Input 
                id="date" 
                type="text" 
                placeholder="DD/MM/YYYY"
                {...register("date", { 
                  required: "Date is required",
                  pattern: { value: /^((0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d)$/, message: "Invalid date format. Use DD/MM/YYYY" }
                })} 
              />
              {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">Start Time</Label>
            <Input id="startTime" type="time" step="1" className="col-span-3" {...register("startTime")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">End Time</Label>
            <Input id="endTime" type="time" step="1" className="col-span-3" {...register("endTime")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distanceM" className="text-right">Distance (m)</Label>
            <Input id="distanceM" type="number" className="col-span-3" {...register("distanceM")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="numHorse" className="text-right">No. of Horses</Label>
            <Input id="numHorse" type="number" className="col-span-3" {...register("numHorse")} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="raceRulesId" className="text-right">Race Rule ID</Label>
            <Controller
              name="raceRulesId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Rule Format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map(fmt => (
                      <SelectItem key={fmt.id} value={fmt.id.toString()}>{fmt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="refereeId" className="text-right">Referee</Label>
            <Controller
              name="refereeId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Referee" />
                  </SelectTrigger>
                  <SelectContent>
                    {referees.map(ref => (
                      <SelectItem key={ref.id} value={ref.id.toString()}>{ref.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expectedDurationMinutes" className="text-right">Expected Duration (min)</Label>
            <Input id="expectedDurationMinutes" type="number" className="col-span-3" {...register("expectedDurationMinutes")} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breakTimeMinutes" className="text-right">Break Time (min)</Label>
            <Input id="breakTimeMinutes" type="number" className="col-span-3" {...register("breakTimeMinutes")} />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">Save Race</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

let startIdx = content.indexOf(oldDialogStart);
let endIdx = content.indexOf(oldDialogEnd) + oldDialogEnd.length;
if (startIdx !== -1 && content.indexOf(oldDialogEnd) !== -1) {
  content = content.substring(0, startIdx) + newDialogDef + content.substring(endIdx);
} else {
  console.log('Could not find AddRaceDialog to replace');
  process.exit(1);
}

content = content.replace(
  '<AddRaceDialog tournamentId={selectedTournament.id} />',
  <RaceFormDialog 
                  mode="add" 
                  tournamentId={selectedTournament.id} 
                  trigger={
                    <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                      <Plus className="mr-2 h-4 w-4" /> Add Race
                    </Button>
                  } 
                />
);

content = content.replace(
  <Button variant="outline" size="sm" disabled={!['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'WALK_OVER'].includes(race.status)}>Update</Button>,
  <RaceFormDialog 
                              mode="edit" 
                              tournamentId={selectedTournament.id}
                              initialData={race}
                              trigger={
                                <Button variant="outline" size="sm" disabled={!['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'WALK_OVER'].includes(race.status)}>Update</Button>
                              }
                            />
);

const racesQueryEnd =   const { data: races = [], isLoading: loadingRaces } = useQuery({
    queryKey: ['races', selectedTournament?.id],
    queryFn: () => adminApi.getRacesByTournament(selectedTournament.id),
    enabled: !!selectedTournament,
    select: (data) => data.races || []
  });;

const cancelMutationHook = 
  const cancelMutation = useMutation({
    mutationFn: (id) => adminApi.cancelRace(id, { reason: "Admin cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries(['races', selectedTournament?.id]);
    },
    onError: (error) => {
      console.error("Failed to cancel race:", error);
    }
  });

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this race?")) {
      cancelMutation.mutate(id);
    }
  };
;

content = content.replace(racesQueryEnd, racesQueryEnd + '\n' + cancelMutationHook);

content = content.replace(
  <Button variant="destructive" size="sm" disabled={!['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'WALK_OVER'].includes(race.status)}>Cancel</Button>,
  <Button variant="destructive" size="sm" onClick={() => handleCancel(race.id)} disabled={!['PENDING_REFEREE', 'PREPARE', 'PUBLISHED', 'WALK_OVER'].includes(race.status)}>Cancel</Button>
);

if (content.indexOf('export function Races() {\\n  const queryClient = useQueryClient();') === -1) {
  content = content.replace('export function Races() {', 'export function Races() {\\n  const queryClient = useQueryClient();');
}

fs.writeFileSync(filePath, content);
console.log('Rewritten successfully!');
