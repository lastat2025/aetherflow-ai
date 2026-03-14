import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

module {
  public type OldTask = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    rewardUSD : Float;
    difficulty : Text;
    status : Text;
    claimedBy : ?Principal;
    submittedResult : ?Text;
    aiScore : ?Nat;
    isAIWorker : Bool;
    createdAt : Int;
  };

  public type Objective = {
    category : Text;
    description : Text;
    targetTaskCount : Nat;
  };

  public type PayoutRecord = {
    taskId : Nat;
    worker : Principal;
    amount : Float;
    triggeredAt : Int;
  };

  public type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextTaskId : Nat;
    tasks : Map.Map<Nat, OldTask>;
    objectives : Map.Map<Text, Objective>;
    payouts : Map.Map<Nat, PayoutRecord>;
    workerStats : Map.Map<Principal, (Nat, Float)>;
    activeWorkers : Set.Set<Principal>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
