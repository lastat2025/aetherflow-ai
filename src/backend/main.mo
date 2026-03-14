import Text "mo:core/Text";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Persistent storage
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextTaskId = 1;

  let tasks = Map.empty<Nat, Task>();
  let objectives = Map.empty<Text, Objective>();
  let payouts = Map.empty<Nat, PayoutRecord>();
  let workerStats = Map.empty<Principal, (Nat, Float)>();
  let activeWorkers = Set.empty<Principal>();

  // Types
  type Task = {
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

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  type Objective = {
    category : Text;
    description : Text;
    targetTaskCount : Nat;
  };

  module Objective {
    public func compare(objective1 : Objective, objective2 : Objective) : Order.Order {
      Text.compare(objective1.category, objective2.category);
    };
  };

  type PayoutRecord = {
    taskId : Nat;
    worker : Principal;
    amount : Float;
    triggeredAt : Int;
  };

  module PayoutRecord {
    public func compare(record1 : PayoutRecord, record2 : PayoutRecord) : Order.Order {
      Nat.compare(record1.taskId, record2.taskId);
    };
  };

  type Analytics = {
    totalTasksCreated : Nat;
    totalTasksApproved : Nat;
    totalEarningsPaid : Float;
    activeWorkers : Nat;
  };

  func isTaskClaimedBy(task : Task, principal : Principal) : Bool {
    switch (task.claimedBy) {
      case (null) { false };
      case (?claimedBy) { claimedBy == principal };
    };
  };

  // User Profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin functions
  public shared ({ caller }) func setObjective(category : Text, description : Text, targetCount : Nat) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set objectives");
    };

    let objective : Objective = {
      category;
      description;
      targetTaskCount = targetCount;
    };

    objectives.add(category, objective);
    "Objective set successfully";
  };

  public query ({ caller }) func getObjectives() : async [Objective] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view objectives");
    };
    objectives.values().toArray().sort();
  };

  public shared ({ caller }) func generateTasks() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can generate tasks");
    };

    var tasksCreated = 0;
    for (objective in objectives.values()) {
      for (taskIndex in Nat.range(0, objective.targetTaskCount - 1)) {
        let taskId = nextTaskId;
        nextTaskId += 1;

        let task : Task = {
          id = taskId;
          title = objective.category # " Task " # taskIndex.toText();
          description = objective.description;
          category = objective.category;
          rewardUSD = 10.0;
          difficulty = "Medium";
          status = "available";
          claimedBy = null;
          submittedResult = null;
          aiScore = null;
          isAIWorker = false;
          createdAt = Time.now();
        };

        tasks.add(taskId, task);
        tasksCreated += 1;
      };
    };

    tasksCreated;
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all tasks");
    };
    tasks.values().toArray().sort();
  };

  public query ({ caller }) func getAnalytics() : async Analytics {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    let totalTasksCreated = tasks.size();
    var totalTasksApproved = 0;
    var totalEarningsPaid = 0.0;

    for (task in tasks.values()) {
      if (task.status == "approved") {
        totalTasksApproved += 1;
      };
    };

    for (payout in payouts.values()) {
      totalEarningsPaid += payout.amount;
    };

    {
      totalTasksCreated;
      totalTasksApproved;
      totalEarningsPaid;
      activeWorkers = activeWorkers.size();
    };
  };

  public query ({ caller }) func getWorkerStats() : async [(Principal, Nat, Float)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view worker stats");
    };

    let entries = workerStats.entries().toArray();
    let results = entries.map(
      func((principal, (taskCount, totalEarnings))) {
        (principal, taskCount, totalEarnings);
      }
    );
    results;
  };

  public query ({ caller }) func getPayoutHistory() : async [PayoutRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view payout history");
    };

    payouts.values().toArray().sort();
  };

  public shared ({ caller }) func triggerPayout(taskId : Nat) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can trigger payouts");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (task.status != "approved") {
          Runtime.trap("Task is not approved for payout");
        };

        switch (task.claimedBy) {
          case (null) { Runtime.trap("Task has no worker assigned") };
          case (?worker) {
            let payout : PayoutRecord = {
              taskId;
              worker;
              amount = task.rewardUSD;
              triggeredAt = Time.now();
            };

            payouts.add(taskId, payout);

            let currentStats = switch (workerStats.get(worker)) {
              case (null) { (0, 0.0) };
              case (?stats) { stats };
            };
            workerStats.add(worker, (currentStats.0 + 1, currentStats.1 + task.rewardUSD));

            "Payout triggered successfully";
          };
        };
      };
    };
  };

  // Worker functions
  public query ({ caller }) func getAvailableTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available tasks");
    };
    let availableTasks = tasks.values().toArray().filter(func(task) { task.status == "available" });
    availableTasks.sort();
  };

  public shared ({ caller }) func claimTask(taskId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (task.status != "available") {
          Runtime.trap("Task is not available for claiming");
        };

        let updatedTask = {
          id = task.id;
          title = task.title;
          description = task.description;
          category = task.category;
          rewardUSD = task.rewardUSD;
          difficulty = task.difficulty;
          status = "claimed";
          claimedBy = ?caller;
          submittedResult = null;
          aiScore = null;
          isAIWorker = task.isAIWorker;
          createdAt = task.createdAt;
        };

        tasks.add(taskId, updatedTask);
        activeWorkers.add(caller);

        "Task claimed successfully";
      };
    };
  };

  public shared ({ caller }) func submitTask(taskId : Nat, result : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (not isTaskClaimedBy(task, caller)) {
          Runtime.trap("Task is not claimed by this user");
        };

        let score = Nat.min(result.size() / 5, 50) +
        (if (result.contains(#text "http")) { 20 } else { 0 }) +
        (taskId % 30);

        let status = if (score >= 60) { "approved" } else { "rejected" };

        let updatedTask = {
          id = task.id;
          title = task.title;
          description = task.description;
          category = task.category;
          rewardUSD = task.rewardUSD;
          difficulty = task.difficulty;
          status;
          claimedBy = task.claimedBy;
          submittedResult = ?result;
          aiScore = ?score;
          isAIWorker = task.isAIWorker;
          createdAt = task.createdAt;
        };

        tasks.add(taskId, updatedTask);
        "Task submitted successfully with status: " # status;
      };
    };
  };

  public query ({ caller }) func getMyTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their tasks");
    };
    let myTasks = tasks.values().toArray().filter(func(task) { isTaskClaimedBy(task, caller) });
    myTasks.sort();
  };

  // Shared
  public query ({ caller }) func getTask(taskId : Nat) : async ?Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { null };
      case (?task) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          ?task;
        } else {
          switch (task.claimedBy) {
            case (null) { Runtime.trap("Unauthorized: Only admins can view unclaimed tasks") };
            case (?taskOwner) {
              if (taskOwner != caller) {
                Runtime.trap("Unauthorized: Can only view your own tasks");
              };
              ?task;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func initializeDefaultObjectives() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize objectives");
    };

    let contentWriting = {
      category = "Content Writing";
      description = "Write short articles and blog posts";
      targetTaskCount = 10;
    };
    let research = {
      category = "Research";
      description = "Summarize online research findings";
      targetTaskCount = 10;
    };
    let dataEntry = {
      category = "Data Entry";
      description = "Classify and enter data sets";
      targetTaskCount = 10;
    };

    objectives.add(contentWriting.category, contentWriting);
    objectives.add(research.category, research);
    objectives.add(dataEntry.category, dataEntry);
  };
};
