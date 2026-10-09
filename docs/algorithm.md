# RebalanceX — Mathematical Formulations & Algorithms

## 1. Smart Team Formation Engine (Problem Statement #11)

### Multi-Objective Composite Fitness Function
For a candidate team $T = \{c_1, c_2, \dots, c_k\}$ of size $k$ and project skill requirements $R = \{r_1, r_2, \dots, r_m\}$:

$$\text{TeamScore}(T) = w_1 \cdot \text{Coverage}(T, R) + w_2 \cdot \overline{\text{Proficiency}}(T) + w_3 \cdot \text{InterestAlignment}(T) + w_4 \cdot \text{Experience}(T) + w_5 \cdot \text{WorkloadBalance}(T) - \text{Penalty}$$

- **Weights**:
  - Skill Coverage: $w_1 = 0.40$
  - Skill Proficiency: $w_2 = 0.20$
  - Domain Interest Alignment: $w_3 = 0.15$
  - Relevant Experience: $w_4 = 0.10$
  - Workload Capacity Balance: $w_5 = 0.15$
- **Hard Constraints**:
  - If a mandatory skill is missing or sub-threshold, $\text{Penalty} = 25 \times N_{\text{missing}}$, preventing unqualified teams from ranking high.

---

## 2. Critical Path Method (CPM) & Scheduling

### Forward Pass (Earliest Times)
For task $t$ with prerequisites $\text{Pred}(t)$ and duration $d(t)$:
$$\text{ES}(t) = \max \left( \max_{p \in \text{Pred}(t)} \text{EF}(p), \text{NextAvailable}(\text{Assignee}(t)) \right)$$
$$\text{EF}(t) = \text{ES}(t) + d(t)$$

### Backward Pass (Latest Times) & Slack
For task $t$ with successors $\text{Succ}(t)$ and project makespan $M = \max_i \text{EF}(i)$:
$$\text{LF}(t) = \min_{s \in \text{Succ}(t)} \text{LS}(s) \quad (\text{or } M \text{ if no successors})$$
$$\text{LS}(t) = \text{LF}(t) - d(t)$$
$$\text{TotalFloat}(t) = \text{LS}(t) - \text{ES}(t)$$

- **Critical Path Condition**: $\text{TotalFloat}(t) \le 0.2 \text{ days}$.

---

## 3. Autonomous Resource Rebalancing (Problem Statement #18)

### Multi-Objective Loss Minimization
$$\min L = \lambda_1 \cdot \text{Delay} + \lambda_2 \cdot \sigma(\text{Workload}) + \lambda_3 \cdot \text{ChurnCount} + \lambda_4 \cdot \text{SkillMismatch}$$

- $\lambda_1 = 8.0$: Penalty per day exceeding project deadline.
- $\lambda_2 = 0.40$: Workload standard deviation across engineers.
- $\lambda_3 = 3.5$: Penalty for unnecessary reallocations from original plan.
- $\lambda_4 = 15.0$: Severe penalty for assigning below required competency level.

### Constraints
1. **Precedence**: $\text{Start}(t_j) \ge \text{End}(t_i) \quad \forall (t_i, t_j) \in \text{Dependencies}$.
2. **Availability**: $\text{Assignee}(t) \notin \text{UnavailableMembers}$.
3. **Skill Qualification**: $\text{Proficiency}(\text{Assignee}(t), \text{Skill}(t)) \ge 1$.
