# Python Code Snippets with Errors for Demonstration

This document contains 20 Python code snippets categorized into **Beginner Errors**, **Advanced Programmer Pitfalls**, and **$O(n^2)$ Performance Anti-Patterns**. Each snippet includes the code, the bug explanation, and the expected behavior or error.

---

## Category 1: Beginner Programmer Snippets

### Snippet 1: Off-By-One Index Error
**Description:** Attempting to access an index beyond the bounds of a list during iteration.

```python
def print_adjacent_pairs(numbers):
    # Bug: range(len(numbers)) goes up to len(numbers) - 1,
    # so numbers[i + 1] raises an IndexError on the last iteration.
    for i in range(len(numbers)):
        print(f"Pair: {numbers[i]} and {numbers[i + 1]}")


# Example usage:
print_adjacent_pairs([10, 20, 30, 40])
```
* **Error:** `IndexError: list index out of range`
* **Fix:** Change loop range to `range(len(numbers) - 1)`.

---

### Snippet 2: Modifying a List While Iterating Over It
**Description:** Removing elements from a list while iterating over it causes Python to skip elements due to index shifting.

```python
def remove_evens(numbers):
    # Bug: Modifying the list during iteration skips checking adjacent elements
    for num in numbers:
        if num % 2 == 0:
            numbers.remove(num)
    return numbers


# Example usage:
data = [2, 4, 6, 7, 8, 10]
print(remove_evens(data))  # Output is unexpectedly [4, 7, 10]
```
* **Issue:** Logic bug due to list mutation during iteration.
* **Fix:** Use list comprehension: `[num for num in numbers if num % 2 != 0]`.

---

### Snippet 3: Mutable Default Argument
**Description:** Using a mutable container (like a list) as a default parameter value retains state across function calls.

```python
def add_item(item, target_list=[]):
    # Bug: target_list is evaluated once when the function is defined
    target_list.append(item)
    return target_list


print(add_item("apple"))  # Output: ['apple']
print(add_item("banana"))  # Output: ['apple', 'banana'] (Expected ['banana'])
```
* **Issue:** Persistent state across independent function calls.
* **Fix:** Use `target_list=None` and set `if target_list is None: target_list = []`.

---

### Snippet 4: Scope / UnboundLocalError
**Description:** Attempting to modify a global variable locally without declaring it `global`.

```python
counter = 0


def increment_counter():
    # Bug: Assignment makes 'counter' local, but it is referenced before assignment
    counter += 1
    return counter


increment_counter()
```
* **Error:** `UnboundLocalError: local variable 'counter' referenced before assignment`
* **Fix:** Add `global counter` inside the function or pass `counter` as a parameter.

---

### Snippet 5: Attempting to Mutate a String
**Description:** Strings in Python are immutable; attempting item assignment raises a `TypeError`.

```python
def capitalize_first_char(text):
    if text:
        # Bug: Strings do not support item assignment
        text[0] = text[0].upper()
    return text


print(capitalize_first_char("hello"))
```
* **Error:** `TypeError: 'str' object does not support item assignment`
* **Fix:** Return `text[0].upper() + text[1:]`.

---

### Snippet 6: Direct Floating-Point Equality Comparison
**Description:** Comparing floating-point calculations using strict equality (`==`) fails due to IEEE 754 precision representation.

```python
def check_sum():
    val1 = 0.1 + 0.2
    val2 = 0.3
    # Bug: 0.1 + 0.2 evaluates to 0.30000000000000004
    if val1 == val2:
        return "Equal"
    else:
        return "Not Equal"


print(check_sum())  # Outputs "Not Equal"
```
* **Issue:** Logic bug caused by floating-point representation limits.
* **Fix:** Use `math.isclose(val1, val2)` or `abs(val1 - val2) < 1e-9`.

---

### Snippet 7: Missing `self` Parameter in Method Definition
**Description:** Class methods must explicitly declare `self` as the first argument to bind instance context.

```python
class User:

    def __init__(self, name):
        self.name = name

    # Bug: Missing 'self' parameter
    def greet():
        return f"Hello, I am {self.name}"


user = User("Alice")
print(user.greet())
```
* **Error:** `TypeError: User.greet() takes 0 positional arguments but 1 was given`
* **Fix:** Define the method as `def greet(self):`.

---

## Category 2: Advanced Programmer Snippets

### Snippet 8: Late Binding Closures in Loops
**Description:** Functions defined inside a loop bind variables by reference, taking their final value when invoked later.

```python
def create_multipliers():
    multipliers = []
    for i in range(5):
        # Bug: 'i' is captured by reference, not by value at creation time
        multipliers.append(lambda x: x * i)
    return multipliers


funcs = create_multipliers()
# All functions use i = 4 (the final loop state)
print([f(2) for f in funcs])  # Outputs [8, 8, 8, 8, 8] instead of [0, 2, 4, 6, 8]
```
* **Issue:** Closure variable late-binding bug.
* **Fix:** Default argument trick: `lambda x, i=i: x * i`.

---

### Snippet 9: Shallow Copying Nested Data Structures
**Description:** Using `list.copy()` or slicing on a nested list creates a shallow copy, leaving inner lists shared.

```python
import copy


def update_matrix(matrix):
    # Bug: Shallow copy copies outer list references, leaving inner lists mutable
    matrix_copy = matrix.copy()
    matrix_copy[0][0] = 999
    return matrix, matrix_copy


original = [[1, 2], [3, 4]]
orig, modified = update_matrix(original)
print(orig[0][0])  # Output: 999 (Original was modified unexpectedly!)
```
* **Issue:** Unintended shared state mutation.
* **Fix:** Use `copy.deepcopy(matrix)`.

---

### Snippet 10: Attempting to Re-consume an Exhausted Generator
**Description:** Generators yield values once and are exhausted upon full traversal.

```python
def get_squares(n):
    return (x**2 for x in range(n))


squares = get_squares(5)
total = sum(squares)
maximum = max(squares, default=-1)

print(f"Total: {total}, Max: {maximum}")  # Max will output -1 because generator is empty!
```
* **Issue:** Silent logic bug due to generator state consumption.
* **Fix:** Convert to list `list(get_squares(5))` if multiple passes are required.

---

### Snippet 11: Modifying Dictionary Size During Iteration
**Description:** Iterating directly over a dictionary while adding or deleting keys causes a runtime error.

```python
def purge_inactive_users(user_db):
    # Bug: Mutating dictionary keys during direct iteration
    for user_id, info in user_db.items():
        if not info.get("active", False):
            del user_db[user_id]
    return user_db


users = {"u1": {"active": True}, "u2": {"active": False}}
purge_inactive_users(users)
```
* **Error:** `RuntimeError: dictionary changed size during iteration`
* **Fix:** Iterate over `list(user_db.items())` or use dictionary comprehension.

---

### Snippet 12: Class Attribute vs. Instance Attribute Mutation
**Description:** Mutating a class-level mutable attribute directly impacts all instances that have not overridden it.

```python
class Environment:
    config = {"debug": False, "timeout": 30}


env1 = Environment()
env2 = Environment()

# Bug: Mutating class dictionary directly affects all instances
env1.config["debug"] = True

print(env2.config["debug"])  # Output: True (env2 unexpectedly affected!)
```
* **Issue:** Shared class state contamination.
* **Fix:** Initialize instance-specific variables inside `__init__` as `self.config = {...}`.

---

### Snippet 13: Exception Masking with Bare `except`
**Description:** Catching `BaseException` or bare `except:` intercepts system signals like `KeyboardInterrupt` and hides debugging traces.

```python
def parse_and_divide(val_str):
    try:
        num = int(val_str)
        return 100 / num
    except:
        # Bug: Masks ZeroDivisionError, ValueError, KeyboardInterrupt, and SyntaxErrors blindly
        return None


# Masks ZeroDivisionError without context, returning None instead of handling properly
print(parse_and_divide("0"))
```
* **Issue:** Anti-pattern that prevents proper exception diagnostics and flow control.
* **Fix:** Catch specific exceptions: `except (ValueError, ZeroDivisionError) as e:`.

---

### Snippet 14: Unsynchronized Shared State in Threads (Race Condition)
**Description:** Concurrent updates to a shared variable without locking mechanism lead to non-deterministic race conditions.

```python
import threading

shared_counter = 0


def increment():
    global shared_counter
    for _ in range(100000):
        # Bug: Non-atomic operation (read-modify-write) without thread lock
        shared_counter += 1


threads = [threading.Thread(target=increment) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Final counter: {shared_counter}")  # Output is unpredictable and < 200000
```
* **Issue:** Data race / concurrency inconsistency.
* **Fix:** Use `threading.Lock()` to synchronize access to `shared_counter`.

---

## Category 3: Common $O(n^2)$ Performance Anti-Patterns

### Snippet 15: String Concatenation Inside a Loop
**Description:** Repeatedly using `+=` on strings inside a loop creates a new string object on each iteration, resulting in $O(n^2)$ time complexity.

```python
def generate_csv_string(data_list):
    result = ""
    # Bug: String allocation + copying on every step results in O(n^2) time complexity
    for item in data_list:
        result += str(item) + ","
    return result[:-1]


data = [i for i in range(50000)]
# Execution slows down exponentially with input size
```
* **Complexity:** Time $O(n^2)$, Space $O(n^2)$
* **Fix:** Use list joining: `",".join(str(item) for item in data_list)` for $O(n)$ efficiency.

---

### Snippet 16: Linear Membership Check (`in list`) Inside Loop
**Description:** Performing `x in list` inside a `for` loop produces nested $O(n)$ operations, leading to $O(n^2)$ execution.

```python
def find_common_elements(list_a, list_b):
    common = []
    # Bug: 'item in list_b' takes O(n) time for every element in list_a
    for item in list_a:
        if item in list_b:
            common.append(item)
    return common
```
* **Complexity:** Time $O(a \times b)$ or $O(n^2)$ when $a \approx b$.
* **Fix:** Convert `list_b` to a set: `set_b = set(list_b)` to reduce lookup to $O(1)$ and overall time to $O(n)$.

---

### Snippet 17: Repeated `list.remove()` or `list.index()` Inside Loop
**Description:** Calling `.remove()` or `.index()` on a list sequentially searches the list from the beginning, resulting in $O(n^2)$ quadratic overhead.

```python
def remove_duplicates(items):
    unique = []
    for item in items:
        # Bug: 'item not in unique' is linear search O(k), total runtime O(n^2)
        if item not in unique:
            unique.append(item)
    return unique
```
* **Complexity:** Time $O(n^2)$
* **Fix:** Use a tracking `set()` for $O(1)$ lookup while preserving order, or `dict.fromkeys(items)`.

---

### Snippet 18: Queue Implementation via `list.pop(0)`
**Description:** Using `list.pop(0)` shifts every subsequent element in memory by one position, turning $n$ operations into $O(n^2)$.

```python
def process_queue(items):
    # Bug: popping from index 0 of a list is an O(n) operation
    while items:
        current = items.pop(0)
        # Process item...
        _ = current
```
* **Complexity:** Time $O(n^2)$
* **Fix:** Use `collections.deque` and call `popleft()`, which runs in $O(1)$ time.

---

### Snippet 19: Pairwise Duplicate Search with Nested Loops
**Description:** Using nested loops over the same list to check for duplicates results in quadratic $O(n^2)$ iteration space.

```python
def has_duplicates(items):
    n = len(items)
    # Bug: Checking every pair explicitly results in n*(n-1)/2 comparisons -> O(n^2)
    for i in range(n):
        for j in range(i + 1, n):
            if items[i] == items[j]:
                return True
    return False
```
* **Complexity:** Time $O(n^2)$
* **Fix:** Compare set length: `return len(items) != len(set(items))` for $O(n)$ time.

---

### Snippet 20: Calculating Cumulative Sums via Repeated Slicing
**Description:** Re-evaluating sum of list slices `sum(arr[:i])` inside a loop computes overlapping sums repeatedly, yielding $O(n^2)$ complexity.

```python
def cumulative_sum_list(numbers):
    result = []
    # Bug: numbers[:i+1] creates a new slice of size i, and sum() iterates through it -> O(n^2)
    for i in range(len(numbers)):
        result.append(sum(numbers[: i + 1]))
    return result
```
* **Complexity:** Time $O(n^2)$
* **Fix:** Accumulate running sum sequentially: `itertools.accumulate(numbers)` or single loop maintaining `current_sum` in $O(n)$ time.