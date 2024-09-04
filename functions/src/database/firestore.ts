import {db} from "../config/firebase";
import * as admin from "firebase-admin";
import {Status} from "../lib/types/shared";
import * as functions from "firebase-functions";
import {FirestoreResponse} from "../lib/types/database";

type RootType = "shopify_pod" | "domain_map";
type SubCollectionType =
  | "orders"
  | "products"
  | "mockups"
  | "daily_analytics"
  | "monthly_analytics";

// ==========================================================================
// 1. Simple Search
// ==========================================================================

/**
 * Performs a simple search on a Firestore collection.
 *
 * @param root Root collection
 * @param id Root document id
 * @param collection Sub collection to be searched
 * @param key - The field key to search for.
 * @param data - The data to be matched.
 * @returns An object containing the status, text, and search result data.
 */
export const simpleSearch = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  key: string,
  data: string,
): Promise<{
  text: string;
  status: number;
  data: {
    list: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> | null;
  };
}> => {
  let text = " - Document found 👍🏻";
  let status = 200;

  const result: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> | null =
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .where(key, "==", data)
      .get();

  if (result.empty) {
    text = " - Document NOT found 👎🏻";
    functions.logger.warn(" 🚨 [SEARCHING] - " + text);
    status = 400;
    return {
      text,
      status,
      data: {
        list: null,
      },
    };
  }

  return {
    text,
    status,
    data: {
      list: result,
    },
  };
};

// ==========================================================================
// 2. Root Document CRUD
// ==========================================================================

/**
 * Creates a root document
 *
 * @param root Root collection
 * @param id Root document id
 * @param data The data to be stored in the document.
 * @returns An object containing the text, status, and data for the created document.
 */
export const createRootDocument = async (
  root: RootType,
  id: string,
  data: object,
): Promise<FirestoreResponse> => {
  let text = " - Document Created 👍🏻. ";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .set({
        ...data,
        id: id,
      });
  } catch {
    text = " - Could not create document.";
    status = 500;
  }

  return {
    text,
    status,
    data: id,
  };
};

/**
 * Fetch a root document
 *
 * @param root Root collection
 * @param id Root document id
 * @returns An object containing the text, status, and data for the created document.
 */
export const fetchRootDocument = async (
  root: RootType,
  id: string,
): Promise<FirestoreResponse> => {
  try {
    const doc = await db.collection(root).doc(id).get();

    if (doc.exists) {
      const data = doc.data();

      return {
        text: root + "/" + id + " document Fetched 👍🏻.",
        status: 200,
        data: data,
      };
    } else {
      return {
        text: root + "/" + id + " document doesn't exist.",
        status: 422,
        data: null,
      };
    }
  } catch (error) {
    functions.logger.error({error});
    return {
      text: root + "/" + id + " failed to fetch document.",
      status: 500,
      data: null,
    };
  }
};

/**
 * Delete a root document
 *
 * @param root Root collection
 * @param id Root document id
 * @returns An object containing the text, status, and data for the deleted document.
 */
export const deleteRootDocument = async (
  root: RootType,
  id: string,
): Promise<FirestoreResponse> => {
  let text = " 🗑️ [SUCCESS]: Document Deleted 👍🏻";
  let status = 200 as Status;

  try {
    await db.collection(root).doc(id).delete();
  } catch {
    text = " 🚨 [DB] Could not delete document." + root + "/" + id;
    status = 500;
    functions.logger.error(text);
  }

  return {
    text,
    status,
    data: true,
  };
};

/**
 * Fetch a root collection
 *
 * @param root Root collection
 * @returns {Promise<FirestoreResponse> } The result of the operation.
 */
export const fetchRootCollection = async (
  root: RootType,
): Promise<FirestoreResponse> => {
  try {
    const query = await db
      .collection(root)
      .orderBy("created_at", "desc")
      .limit(250)
      .get();

    if (query.empty) {
      return {
        text: root + " collection doesn't exist",
        status: 422,
        data: null,
      };
    } else {
      const collection = [] as admin.firestore.DocumentData[];

      query.forEach(async (doc) => {
        if (doc.exists) {
          const data = doc.data();
          collection.push(data);
        }
      });
      return {
        text: root + " collection Fetched 👍🏻",
        status: 200,
        data: collection,
      };
    }
  } catch (error) {
    const text = " Failed to fetch collection";
    functions.logger.error(text, {error});
    return {
      text: text,
      status: 500,
      data: null,
    };
  }
};

/**
 * Update a root document
 *
 * @param root Root collection
 * @param id Root document id
 * @param data The data to be stored in the document.
 * @returns An object containing the text, status, and data for the updated document.
 */
export const updateRootDocument = async (
  root: RootType,
  id: string,
  data: object,
): Promise<FirestoreResponse> => {
  let text = " - Document Updated 👍🏻. ";
  let status = 200 as Status;

  try {
    await db.collection(root).doc(id).set(data, {merge: true});
  } catch {
    text = " - Could not update document.";
    status = 500;
  }

  return {
    text,
    status,
    data: id,
  };
};

// ==========================================================================
// 3. Subcollection Document CRUD
// ==========================================================================

/**
 * Creates a subcollection document in Firestore.
 * @param {string} root - The root collection name.
 * @param {string} id - The ID of the root document.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The ID for the new subcollection document.
 * @param {object} data - The data to store in the new document.
 * @returns {Promise<FirestoreResponse>} The result of the create operation.
 */
export const createSubcollectionDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  data: object,
): Promise<FirestoreResponse> => {
  let text = " - Document Created 👍🏻. ";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .set({
        ...data,
        id: sub_id,
      });
  } catch {
    text = " - Could not create document.";
    status = 500;
  }

  return {
    text,
    status,
    data: id,
  };
};

/**
 * Fetches a subcollection document from Firestore.
 * @param {string} root - The root collection name.
 * @param {string} id - The ID of the root document.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The ID of the subcollection document to fetch.
 * @returns {Promise<FirestoreResponse>} The result of the fetch operation.
 */
export const fetchSubcollectionDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
): Promise<FirestoreResponse> => {
  try {
    const doc = await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .get();

    if (doc.exists) {
      const data = doc.data();

      return {
        text: root + "/" + id + " document Fetched 👍🏻.",
        status: 200,
        data: data,
      };
    } else {
      return {
        text: root + "/" + id + " document doesn't exist.",
        status: 422,
        data: null,
      };
    }
  } catch (error) {
    functions.logger.error({error});
    return {
      text: root + "/" + id + " failed to fetch document.",
      status: 500,
      data: null,
    };
  }
};

/**
 * Deletes a subcollection document from Firestore.
 * @param {string} root - The root collection name.
 * @param {string} id - The ID of the root document.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The ID of the subcollection document to delete.
 * @returns {Promise<FirestoreResponse>} The result of the delete operation.
 */
export const deleteSubcollectionDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
): Promise<FirestoreResponse> => {
  let text = " 🗑️ [SUCCESS]: Document Deleted 👍🏻";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .delete();
  } catch {
    text = " 🚨 [DB] Could not delete document." + root + "/" + id;
    status = 500;
    functions.logger.error(text);
  }

  return {
    text,
    status,
    data: true,
  };
};

/**
 * Fetches all documents from a specified subcollection.
 * @param {string} root - The root collection name.
 * @param {string} id - The ID of the root document.
 * @param {string} collection - The subcollection name.
 * @returns {Promise<FirestoreResponse>} The result of the fetch operation.
 */
export const fetchSubcollectionCollection = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
): Promise<FirestoreResponse> => {
  try {
    const query = await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .orderBy("created_at", "desc")
      .limit(250)
      .get();

    if (query.empty) {
      return {
        text: root + " collection doesn't exist",
        status: 422,
        data: null,
      };
    } else {
      const collection = [] as admin.firestore.DocumentData[];

      query.forEach(async (doc) => {
        if (doc.exists) {
          const data = doc.data();
          collection.push(data);
        }
      });
      return {
        text: root + " collection Fetched 👍🏻",
        status: 200,
        data: collection,
      };
    }
  } catch (error) {
    const text = " Failed to fetch collection";
    functions.logger.error(text, {error});
    return {
      text: text,
      status: 500,
      data: null,
    };
  }
};

/**
 * Updates a subcollection document in Firestore.
 * @param {string} root - The root collection name.
 * @param {string} id - The ID of the root document.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The ID of the subcollection document to update.
 * @param {object} data - The data for updating the document.
 * @returns {Promise<FirestoreResponse>} The result of the update operation.
 */
export const updateSubcollectionDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  data: object,
): Promise<FirestoreResponse> => {
  let text = " - Document Updated 👍🏻. ";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .set(data, {merge: true});
  } catch {
    text = " - Could not update document.";
    status = 500;
  }

  return {
    text,
    status,
    data: id,
  };
};

/**
 * Fetch paginated Items from a Firestore nested collection.
 *
 * @param {string} root - The root collection name.
 * @param {string} id - The root document ID.
 * @param {string} collection - The subcollection name.
 * @param {string | number} timestamp - Timestamp of the last or first item depending on the direction.
 * @param {"next" | "prev"} direction - The direction for pagination, either 'next' or 'prev'.
 * @returns {Promise<FirestoreResponse>} Response object with status, text, and data.
 */
export const fetchPaginatedSubcollection = async (
  root: string,
  id: string,
  collection: string,
  timestamp: string | number,
  direction: "next" | "prev" = "next",
): Promise<FirestoreResponse> => {
  try {
    // Validate input parameters
    if (!root || !id || !collection || !timestamp) {
      return {
        text: " - Invalid input parameters.",
        status: 400,
        data: null,
      };
    }

    const orderDirection = direction === "next" ? "desc" : "asc";
    const query = await admin
      .firestore()
      .collection(root)
      .doc(id)
      .collection(collection)
      .orderBy("time", orderDirection)
      .startAfter(timestamp)
      .limit(250)
      .get();

    if (query.empty) {
      return {
        text: " - Collection fetched but it is empty.",
        status: 422, // No Content
        data: [],
      };
    }

    const items = query.docs.map((doc) => doc.data());

    return {
      text: " - Collection fetched successfully.",
      status: 200,
      data: items,
    };
  } catch (error) {
    const text = " - Failed to fetch collection.";
    functions.logger.error(text, {error});
    return {
      text: text,
      status: 500,
      data: null,
    };
  }
};
// ==========================================================================
// 4. Nested Document CRUD
// ==========================================================================

/**
 * Creates a nested document within a Firestore subcollection.
 * @param {string} root - The root collection name.
 * @param {string} id - The root document ID.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The ID of the parent document.
 * @param {string} nested - The nested subcollection name.
 * @param {string} nested_id - The nested document ID to create.
 * @param {object} data - The data to store in the document.
 * @returns {Promise<FirestoreResponse>} Response object with status, text, and data.
 */
export const createNestedDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  nested: "daily",
  nested_id: string,
  data: object,
): Promise<FirestoreResponse> => {
  let text = " - Document Created 👍🏻. ";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .collection(nested)
      .doc(nested_id)
      .set({
        ...data,
        id: nested_id,
      });
  } catch {
    text = " - Could not create document.";
    status = 500;
  }

  return {
    text,
    status,
    data: id,
  };
};

/**
 * Fetches a nested document from a Firestore subcollection.
 * @param {string} root - The root collection name.
 * @param {string} id - The root document ID.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The parent document ID.
 * @param {string} nested - The nested subcollection name.
 * @param {string} nested_id - The nested document ID to fetch.
 * @returns {Promise<FirestoreResponse>} Response object with status, text, and data.
 */
export const fetchNestedDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  nested: "daily",
  nested_id: string,
): Promise<FirestoreResponse> => {
  try {
    const doc = await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .collection(nested)
      .doc(nested_id)
      .get();

    if (doc.exists) {
      const data = doc.data();

      return {
        text: root + "/" + id + " document Fetched 👍🏻.",
        status: 200,
        data: data,
      };
    } else {
      return {
        text: root + "/" + id + " document doesn't exist.",
        status: 422,
        data: null,
      };
    }
  } catch (error) {
    functions.logger.error({error});
    return {
      text: root + "/" + id + " failed to fetch document.",
      status: 500,
      data: null,
    };
  }
};

/**
 * Deletes a nested document within a Firestore subcollection.
 * @param {string} root - The root collection name.
 * @param {string} id - The root document ID.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The parent document ID.
 * @param {string} nested - The nested subcollection name.
 * @param {string} nested_id - The nested document ID to delete.
 * @returns {Promise<FirestoreResponse>} Response object with status and text.
 */
export const deleteNestedDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  nested: "daily",
  nested_id: string,
): Promise<FirestoreResponse> => {
  let text = " 🗑️ [SUCCESS]: Document Deleted 👍🏻";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .collection(nested)
      .doc(nested_id)
      .delete();
  } catch {
    text = " 🚨 [DB] Could not delete document." + root + "/" + id;
    status = 500;
    functions.logger.error(text);
  }

  return {
    text,
    status,
    data: true,
  };
};

/**
 * Fetches all documents from a nested collection within a Firestore subcollection.
 * @param {string} root - The root collection name.
 * @param {string} id - The root document ID.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The parent document ID.
 * @param {string} nested - The nested subcollection name.
 * @returns {Promise<FirestoreResponse>} Response object with status, text, and data.
 */
export const fetchNestedCollection = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  nested: "daily",
): Promise<FirestoreResponse> => {
  try {
    const query = await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .collection(nested)
      .limit(250)
      .get();

    // .orderBy("created_at", "desc")

    if (query.empty) {
      return {
        text: root + " collection doesn't exist",
        status: 422,
        data: null,
      };
    } else {
      const collection = [] as admin.firestore.DocumentData[];

      query.forEach(async (doc) => {
        if (doc.exists) {
          const data = doc.data();
          collection.push(data);
        }
      });
      return {
        text: root + " collection Fetched 👍🏻",
        status: 200,
        data: collection,
      };
    }
  } catch (error) {
    const text = " Failed to fetch collection";
    functions.logger.error(text, {error});
    return {
      text: text,
      status: 500,
      data: null,
    };
  }
};

/**
 * Updates a nested document within a Firestore subcollection.
 * @param {string} root - The root collection name.
 * @param {string} id - The root document ID.
 * @param {string} collection - The subcollection name.
 * @param {string} sub_id - The parent document ID.
 * @param {string} nested - The nested subcollection name.
 * @param {string} nested_id - The nested document ID to update.
 * @param {object} data - The data to update in the document.
 * @returns {Promise<FirestoreResponse>} Response object with status, text, and data.
 */
export const updateNestedDocument = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  sub_id: string,
  nested: "daily",
  nested_id: string,
  data: object,
): Promise<FirestoreResponse> => {
  let text = " - Document Updated 👍🏻. ";
  let status = 200 as Status;

  try {
    await db
      .collection(root)
      .doc(id)
      .collection(collection)
      .doc(sub_id)
      .collection(nested)
      .doc(nested_id)
      .set(data, {merge: true});
  } catch {
    text = " - Could not update document.";
    status = 500;
  }

  return {
    text,
    status,
    data: id,
  };
};

// ==========================================================================
// 1. Simple Search
// ==========================================================================

/**
 * Performs a search on a Firestore collection for a range from previous date to now.
 *
 * @param root Root collection
 * @param id Root document id
 * @param collection Sub collection to be searched
 * @param data - The data to be matched.
 * @returns An object containing the status, text, and search result data.
 */
export const analyticsSearch = async (
  root: RootType,
  id: string,
  collection: SubCollectionType,
  date: string,
): Promise<FirestoreResponse> => {
  try {
    const query: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> | null =
      await db
        .collection(root)
        .doc(id)
        .collection(collection)
        .where("id", ">=", date)
        .get();

    if (query.empty) {
      return {
        text: root + " collection doesn't exist",
        status: 422,
        data: null,
      };
    } else {
      const collection = [] as admin.firestore.DocumentData[];

      query.forEach(async (doc) => {
        if (doc.exists) {
          const data = doc.data();
          collection.push(data);
        }
      });
      return {
        text: root + " collection Fetched 👍🏻",
        status: 200,
        data: collection,
      };
    }
  } catch (error) {
    const text = " Failed to fetch collection";
    functions.logger.error(text, {error});
    return {
      text: text,
      status: 500,
      data: null,
    };
  }
};
